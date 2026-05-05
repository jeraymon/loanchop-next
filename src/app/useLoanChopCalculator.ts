"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useStableEvent } from "@/hooks/useStableEvent";
import { useFormCalculatorController } from "@/lib/calculators/useFormCalculatorController";
import { useObjectState } from "@/lib/calculators/useObjectState";
import {
  compareWithAndWithoutExtra,
  type AmortizationRow,
  type ComparisonResult,
  type ExtraPaymentEntry,
} from "./calc";

// ---------------------------------------------------------------------------
// Schema (string-based for useAutoCalculate)
// ---------------------------------------------------------------------------

// Bounded validators. The amortization schedule allocates `years × 12` rows,
// so an unbounded `years` value would allocate millions of rows and lock the
// browser. Recurring extra-payment edits (`onClickApplyToRest`) iterate
// `editingMonth..totalMonths`, which inherits the same bound. We also use
// `Number.isFinite` to reject "Infinity"/"1e500" strings before they reach
// Number/BigNumber math.
const PRINCIPAL_MAX = 1_000_000_000; // $1B is generous
const RATE_MAX = 100; // 100% APR is generous
const YEARS_MAX = 50; // longest realistic mortgage; caps schedule at 600 rows
const positiveNum = z.string().min(1, "Required").refine(
  (v) => Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) <= PRINCIPAL_MAX,
  `Must be a positive number ≤ ${PRINCIPAL_MAX.toLocaleString()}`,
);
const nonNegativeNum = z.string().min(1, "Required").refine(
  (v) => Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= PRINCIPAL_MAX,
  `Must be a non-negative number ≤ ${PRINCIPAL_MAX.toLocaleString()}`,
);
const nonNegativeRate = z.string().min(1, "Required").refine(
  (v) => Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= RATE_MAX,
  `Must be a non-negative number ≤ ${RATE_MAX}`,
);
const positiveIntYears = z.string().min(1, "Required").refine(
  (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n <= YEARS_MAX && Number.isInteger(n);
  },
  `Must be a positive whole number ≤ ${YEARS_MAX}`,
);

const schema = z.object({
  principal: positiveNum,
  annualRate: nonNegativeRate,
  years: positiveIntYears,
  extraPayment: nonNegativeNum,
});

const schemas = { default: schema } as const;
const DEFAULT_FORM_VALUES = {
  principal: "200000",
  annualRate: "6",
  years: "30",
  extraPayment: "0",
};
type SolveFor = "default";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function fmtCurrency(n: number): string {
  if (!Number.isFinite(n)) return "Invalid";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo`;
}

export interface ExampleConfig {
  principal: string;
  annualRate: string;
  years: string;
  extraPayment: string;
}

const QUICK_ANSWER_DEFAULT =
  "Compare a normal loan payoff against an accelerated payoff with extra payments to see monthly payment, total interest, and how much time you save.";

/** Resolve a start-date anchor. Month 1 of the schedule is the first payment,
 *  so an anchor of { year: 2026, month: 3 } means row #1 is Mar 2026. If no
 *  anchor is provided, the current month is used (preserves legacy behavior). */
export interface StartDateAnchor {
  year: number;
  /** 1-12 (one-indexed). */
  month: number;
}

export function payoffDate(months: number, anchor?: StartDateAnchor): string {
  const base = anchor
    ? new Date(anchor.year, anchor.month - 1, 1)
    : new Date();
  // payoffDate reports the month AFTER the last payment clears the loan,
  // which for a schedule of length `months` is anchor + (months - 1) months
  // when anchor = month of the first payment. Subtract 1 to land on the
  // final payment's month rather than overshooting by one.
  const offset = anchor ? Math.max(months - 1, 0) : months;
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthToDate(monthNum: number, anchor?: StartDateAnchor): string {
  const base = anchor
    ? new Date(anchor.year, anchor.month - 1, 1)
    : new Date();
  // With an anchor, row #1 is the anchor month itself. Without one, preserve
  // the historical "current month + monthNum" behavior (which starts the
  // schedule one month past today).
  const offset = anchor ? monthNum - 1 : monthNum;
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${d.getFullYear()}-${MONTH_ABBR[d.getMonth()]}`;
}

// ---------------------------------------------------------------------------
// One-time legacy backup
// ---------------------------------------------------------------------------

/** Immutable snapshot of every legacy loanchop localStorage key at the moment
 *  the user first lands on the new Next.js calculator. Written once — if this
 *  key already exists it is NEVER touched again, regardless of later app
 *  behavior. This protects users like Cory whose data dates back to the
 *  Sencha version: any bug in our save/delete logic can still clobber the
 *  live slots, but the backup remains intact and recoverable via DevTools. */
const LEGACY_BACKUP_KEY = "loanchop_legacy_backup_v1";

/** Matches every key the legacy Sencha app and this calculator write to:
 *  base fields across 3 slots + per-month recurring/single extras across
 *  3 slots. Anything else in localStorage is ignored. */
function isLegacyLoanchopKey(key: string): boolean {
  const BASE_NAMES = ["loanAmount", "loanInterestRate", "loanTermYears", "loanMonth", "loanYear", "loanExists"];
  for (const name of BASE_NAMES) {
    if (key === name || key === `${name}a2` || key === `${name}a3`) return true;
  }
  if (/^recurringExtraPayment\d+(a[23])?$/.test(key)) return true;
  if (/^singleExtraPayment\d+(a[23])?$/.test(key)) return true;
  return false;
}

/** Create the immutable legacy backup if it doesn't exist yet. Guaranteed to
 *  be a no-op on every call after the first. Safe to call during mount. */
function createLegacyBackupIfMissing(): void {
  if (typeof window === "undefined") return;
  try {
    // If the backup already exists — even if it's an empty marker written
    // on a prior visit by a user who had no legacy data — do not touch it.
    if (localStorage.getItem(LEGACY_BACKUP_KEY) != null) return;

    const snapshot: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !isLegacyLoanchopKey(k)) continue;
      const v = localStorage.getItem(k);
      if (v != null) snapshot[k] = v;
    }

    // Always write the marker, even when the snapshot is empty. This way a
    // brand-new user (who has no legacy data on first visit but later saves
    // through the new UI) does NOT retroactively "back up" their own live
    // saves the next time the page loads — the backup step is truly once.
    const payload = JSON.stringify({
      createdAt: new Date().toISOString(),
      keys: snapshot,
    });
    localStorage.setItem(LEGACY_BACKUP_KEY, payload);
  } catch {
    // If storage is unavailable (private mode, quota), silently skip the
    // backup rather than break the page. No user data is harmed.
  }
}

// ---------------------------------------------------------------------------
// Save-slot persistence (3 slots, legacy-compatible localStorage keys)
// ---------------------------------------------------------------------------

export type SlotNumber = 1 | 2 | 3;

/** Legacy Sencha app used suffix = "" for slot 1, "a2" for slot 2, "a3" for
 *  slot 3. Per-month extras are stored as `recurringExtraPayment{month}{suf}`
 *  and `singleExtraPayment{month}{suf}`. Keeping these keys identical means
 *  any existing legacy saved loan in a user's browser loads transparently. */
function slotSuffix(slot: SlotNumber): string {
  return slot === 1 ? "" : `a${slot}`;
}

function parseFiniteNonNegative(value: string | null): number {
  const n = Number(value ?? "0");
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Max months we'll scan for per-month extras. 30yr × 12 + a little slack. */
const MAX_EXTRA_MONTHS = 480;

export interface SavedLoan {
  principal: string;
  annualRate: string;
  years: string;
  loanMonth: number;
  loanYear: number;
  extraEntries: ExtraPaymentEntry[];
}

export type SaveResult = { ok: true } | { ok: false; reason: string };

function readSlot(slot: SlotNumber): SavedLoan | null {
  if (typeof window === "undefined") return null;
  const s = slotSuffix(slot);
  if (!localStorage.getItem(`loanExists${s}`)) return null;

  const principal = localStorage.getItem(`loanAmount${s}`);
  const annualRate = localStorage.getItem(`loanInterestRate${s}`);
  const years = localStorage.getItem(`loanTermYears${s}`);
  const loanMonthRaw = localStorage.getItem(`loanMonth${s}`);
  const loanYearRaw = localStorage.getItem(`loanYear${s}`);
  // Reject partially-written / corrupted slots: the base fields must be
  // present AND parse as valid numbers. Loading garbage would silently
  // replace the user's form and look like data loss to them.
  if (!principal || !annualRate || !years) return null;
  const principalValue = Number(principal);
  const annualRateValue = Number(annualRate);
  const yearsValue = Number(years);
  if (!Number.isFinite(principalValue) || principalValue <= 0) return null;
  if (!Number.isFinite(annualRateValue) || annualRateValue < 0) return null;
  if (!Number.isFinite(yearsValue) || yearsValue <= 0) return null;

  const now = new Date();
  const loanMonth = Number(loanMonthRaw);
  const loanYear = Number(loanYearRaw);

  const extraEntries: ExtraPaymentEntry[] = [];
  for (let m = 1; m <= MAX_EXTRA_MONTHS; m++) {
    const rec = parseFiniteNonNegative(localStorage.getItem(`recurringExtraPayment${m}${s}`));
    const sin = parseFiniteNonNegative(localStorage.getItem(`singleExtraPayment${m}${s}`));
    if (rec > 0 || sin > 0) {
      extraEntries.push({ month: m, recurring: rec, single: sin });
    }
  }

  return {
    principal,
    annualRate,
    years,
    loanMonth: Number.isFinite(loanMonth) && loanMonth >= 1 && loanMonth <= 12 ? loanMonth : now.getMonth() + 1,
    loanYear: Number.isFinite(loanYear) && loanYear > 1900 ? loanYear : now.getFullYear(),
    extraEntries,
  };
}

/** Capture every key belonging to a slot so we can roll back if a write
 *  partially succeeds (quota exceeded, Safari private mode, disk full, etc.).
 *  Without this, a throw mid-write could leave the slot half-cleared and the
 *  user's real data gone. */
function snapshotSlot(slot: SlotNumber): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const s = slotSuffix(slot);
  const snap: Record<string, string | null> = {};
  const baseKeys = [
    `loanAmount${s}`, `loanInterestRate${s}`, `loanTermYears${s}`,
    `loanMonth${s}`, `loanYear${s}`, `loanExists${s}`,
  ];
  for (const k of baseKeys) snap[k] = localStorage.getItem(k);
  for (let m = 1; m <= MAX_EXTRA_MONTHS; m++) {
    const rk = `recurringExtraPayment${m}${s}`;
    const sk = `singleExtraPayment${m}${s}`;
    const rv = localStorage.getItem(rk);
    const sv = localStorage.getItem(sk);
    if (rv != null) snap[rk] = rv;
    if (sv != null) snap[sk] = sv;
  }
  return snap;
}

function restoreSnapshot(snap: Record<string, string | null>): void {
  if (typeof window === "undefined") return;
  // Best-effort restore; if this throws too, we accept the damage rather
  // than loop. The user's original data was already copied into `snap` so
  // at worst they can re-save from the captured values out-of-band.
  for (const [k, v] of Object.entries(snap)) {
    try {
      if (v == null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {
      /* swallow and continue — best effort */
    }
  }
}

/** Returns true on successful write, false on any storage error (quota,
 *  private-browsing restriction, etc.). On failure, the slot is rolled back
 *  to its pre-write state so existing data is never lost. */
function writeSlot(slot: SlotNumber, loan: SavedLoan): boolean {
  if (typeof window === "undefined") return false;
  const s = slotSuffix(slot);
  const snap = snapshotSlot(slot);
  try {
    localStorage.setItem(`loanAmount${s}`, loan.principal);
    localStorage.setItem(`loanInterestRate${s}`, loan.annualRate);
    localStorage.setItem(`loanTermYears${s}`, loan.years);
    localStorage.setItem(`loanMonth${s}`, String(loan.loanMonth));
    localStorage.setItem(`loanYear${s}`, String(loan.loanYear));
    localStorage.setItem(`loanExists${s}`, "1");
    // Clear any previous per-month extras so we don't leave stale entries behind.
    for (let m = 1; m <= MAX_EXTRA_MONTHS; m++) {
      localStorage.removeItem(`recurringExtraPayment${m}${s}`);
      localStorage.removeItem(`singleExtraPayment${m}${s}`);
    }
    for (const e of loan.extraEntries) {
      if (!Number.isInteger(e.month) || e.month < 1 || e.month > MAX_EXTRA_MONTHS) continue;
      if (Number.isFinite(e.recurring) && e.recurring > 0) localStorage.setItem(`recurringExtraPayment${e.month}${s}`, String(e.recurring));
      if (Number.isFinite(e.single) && e.single > 0) localStorage.setItem(`singleExtraPayment${e.month}${s}`, String(e.single));
    }
    return true;
  } catch {
    restoreSnapshot(snap);
    return false;
  }
}

function clearSlot(slot: SlotNumber): void {
  if (typeof window === "undefined") return;
  const s = slotSuffix(slot);
  localStorage.removeItem(`loanAmount${s}`);
  localStorage.removeItem(`loanInterestRate${s}`);
  localStorage.removeItem(`loanTermYears${s}`);
  localStorage.removeItem(`loanMonth${s}`);
  localStorage.removeItem(`loanYear${s}`);
  localStorage.removeItem(`loanExists${s}`);
  for (let m = 1; m <= MAX_EXTRA_MONTHS; m++) {
    localStorage.removeItem(`recurringExtraPayment${m}${s}`);
    localStorage.removeItem(`singleExtraPayment${m}${s}`);
  }
}

function slotExists(slot: SlotNumber): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(`loanExists${slotSuffix(slot)}`);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLoanChopCalculator() {
  const derivedState = useObjectState<{
    solutionLabel: string | null;
    solutionValue: string | null;
    result: ComparisonResult | null;
  }>({
    solutionLabel: null,
    solutionValue: null,
    result: null,
  });

  // First payment anchor. Stable literal defaults so SSG prerender and
  // client hydration produce matching HTML; the real current month/year is
  // applied in a mount effect below. Cannot seed from `new Date()` in the
  // initializer because SSG runs it at build time and freezes the build
  // month into the static HTML — every visitor would then see a stale
  // month until the next deploy, plus a hydration mismatch warning.
  const [startMonth, setStartMonth] = useState<number>(1);
  const [startYear, setStartYear] = useState<number>(2026);
  const startAnchor = useMemo<StartDateAnchor>(
    () => ({ month: startMonth, year: startYear }),
    [startMonth, startYear],
  );

  // Per-row extra payment entries (editable in the amortization table)
  const [extraEntries, setExtraEntries] = useState<ExtraPaymentEntry[]>([]);

  // Editing state for a single row
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editRecurring, setEditRecurring] = useState("0");
  const [editSingle, setEditSingle] = useState("0");

  // Determine if per-row entries are active
  const hasPerRowEntries = extraEntries.length > 0;

  const compute = useStableEvent((data: Record<string, string>, _solveFor: SolveFor) => {
    void _solveFor;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      derivedState.merge({
        solutionLabel: null,
        solutionValue: null,
        result: null,
      });
      return;
    }
    const principal = Number(data.principal);
    const annualRate = Number(data.annualRate);
    const years = Number(data.years);
    const extraPayment = Number(data.extraPayment);
    if (principal <= 0 || years <= 0) {
      derivedState.merge({
        solutionLabel: null,
        solutionValue: null,
        result: null,
      });
      return;
    }
    const r = compareWithAndWithoutExtra(
      principal,
      annualRate,
      years,
      extraPayment,
      hasPerRowEntries ? extraEntries : undefined,
    );
    derivedState.merge({
      result: r,
      solutionLabel: "Monthly Payment =",
      solutionValue: fmtCurrency(r.monthlyPayment),
    });
  });

  const controller = useFormCalculatorController<SolveFor>({
    defaultValues: DEFAULT_FORM_VALUES,
    schemas,
    initialSolveFor: "default",
    compute,
  });
  const { getValues } = controller.form;
  const { applyAndRecompute, loadValues } = controller.actions;

  // Re-compute when extraEntries change so compute (via useStableEvent)
  // reads the new entries immediately in the same update cycle.
  const handleExtraEntriesChange = useCallback((newEntries: ExtraPaymentEntry[]) => {
    applyAndRecompute(() => {
      setExtraEntries(newEntries);
    });
  }, [applyAndRecompute]);

  const values = getValues();
  const result = derivedState.state.result;
  const flatExtraValue = Number(values.extraPayment);
  const hasFlatExtra = Number.isFinite(flatExtraValue) && flatExtraValue > 0;
  const hasExtra =
    result &&
    (hasFlatExtra || hasPerRowEntries) &&
    result.acceleratedSchedule.length < result.normalSchedule.length;
  // Also show savings cards if interest was actually saved (even if same # months)
  const showSavings =
    result &&
    (hasFlatExtra || hasPerRowEntries) &&
    result.interestSaved > 0;

  // Amortization table (scrollable, shows every 12th month by default)
  const [showAllRows, setShowAllRows] = useState(false);

  // Build normal schedule lookup by month for side-by-side display
  const normalByMonth = useMemo(() => {
    if (!result) return new Map<number, AmortizationRow>();
    const map = new Map<number, AmortizationRow>();
    for (const row of result.normalSchedule) map.set(row.month, row);
    return map;
  }, [result]);

  // Build full display schedule: accelerated rows + remaining normal-only rows
  // so the normal side always completes to the end of the loan term.
  const fullSchedule = useMemo(() => {
    if (!result) return [];
    const acc = result.acceleratedSchedule;
    const norm = result.normalSchedule;
    if (acc.length >= norm.length) return acc;
    // After accelerated ends, append normal rows (extra side will show "Paid off")
    return [...acc, ...norm.slice(acc.length)];
  }, [result]);

  const displaySchedule = useMemo(() => {
    if (!fullSchedule.length) return [];
    if (showAllRows) return fullSchedule;
    return fullSchedule.filter((r) => r.month % 12 === 0 || r.month === 1 || r.month === fullSchedule.length);
  }, [fullSchedule, showAllRows]);

  // Build a lookup of extra entries by month for display. Per-month only — no
  // carry-forward. Recurring expansion happens at edit time in saveEdit below,
  // so extraEntries already contains one entry per affected month.
  const extraByMonth = useMemo(() => {
    const map = new Map<number, { recurring: number; single: number }>();
    for (const e of extraEntries) {
      const recurring = Number.isFinite(e.recurring) && e.recurring > 0 ? e.recurring : 0;
      const single = Number.isFinite(e.single) && e.single > 0 ? e.single : 0;
      if (Number.isFinite(e.month) && (recurring > 0 || single > 0)) {
        map.set(e.month, { recurring, single });
      }
    }
    return map;
  }, [extraEntries]);

  // Start editing a row
  const startEdit = useCallback(
    (month: number) => {
      const existing = extraByMonth.get(month);
      // Find the raw recurring entry for this specific month (not inherited)
      const rawEntry = extraEntries.find((e) => e.month === month);
      setEditRecurring(rawEntry?.recurring?.toString() ?? existing?.recurring?.toString() ?? "0");
      setEditSingle(existing?.single?.toString() ?? "0");
      setEditingMonth(month);
    },
    [extraByMonth, extraEntries],
  );

  // Save the edited row. Matches legacy Sencha semantics: a recurring edit at
  // month M propagates the recurring value to months M..totalMonths, while
  // `single` applies to month M only. Existing `single` values at later
  // months are preserved; existing recurring values in the range are
  // overwritten. Setting recurring=0 at month M stops a prior recurring.
  const saveEdit = useCallback(() => {
    if (editingMonth === null || !Number.isFinite(editingMonth)) return;
    const recurring = parseFiniteNonNegative(editRecurring);
    const single = parseFiniteNonNegative(editSingle);

    const years = Number(getValues().years);
    const totalMonths =
      Number.isFinite(years) && years > 0 ? Math.round(years * 12) : 0;
    if (totalMonths === 0) {
      setEditingMonth(null);
      return;
    }

    const map = new Map<number, { recurring: number; single: number }>();
    for (const e of extraEntries) {
      const recurring = Number.isFinite(e.recurring) && e.recurring > 0 ? e.recurring : 0;
      const single = Number.isFinite(e.single) && e.single > 0 ? e.single : 0;
      if (Number.isFinite(e.month)) {
        map.set(e.month, { recurring, single });
      }
    }

    map.set(editingMonth, { recurring, single });
    for (let m = editingMonth + 1; m <= totalMonths; m++) {
      const existing = map.get(m) ?? { recurring: 0, single: 0 };
      map.set(m, { recurring, single: existing.single });
    }

    const next: ExtraPaymentEntry[] = [];
    for (const [month, vals] of map.entries()) {
      const nextRecurring = Number.isFinite(vals.recurring) && vals.recurring > 0 ? vals.recurring : 0;
      const nextSingle = Number.isFinite(vals.single) && vals.single > 0 ? vals.single : 0;
      if (Number.isFinite(month) && (nextRecurring > 0 || nextSingle > 0)) {
        next.push({ month, recurring: nextRecurring, single: nextSingle });
      }
    }
    next.sort((a, b) => a.month - b.month);

    setEditingMonth(null);
    handleExtraEntriesChange(next);
  }, [editingMonth, editRecurring, editSingle, extraEntries, getValues, handleExtraEntriesChange]);

  const cancelEdit = useCallback(() => {
    setEditingMonth(null);
  }, []);

  // Clear all per-row entries
  const clearAllEntries = useCallback(() => {
    setEditingMonth(null);
    handleExtraEntriesChange([]);
  }, [handleExtraEntriesChange]);

  // -------------------------------------------------------------------------
  // Save / Open / Delete slots
  // -------------------------------------------------------------------------

  // Tri-state of whether each slot currently holds a saved loan. Populated
  // from localStorage on mount (client-only; SSR returns all false to match
  // the static HTML the initial render produced).
  const [slotStatuses, setSlotStatuses] = useState<[boolean, boolean, boolean]>([false, false, false]);

  const refreshSlotStatuses = useCallback(() => {
    setSlotStatuses([slotExists(1), slotExists(2), slotExists(3)]);
  }, []);

  useEffect(() => {
    // Mount-only: sync localStorage → React state. The dep is a stable
    // useCallback([]) so this runs exactly once. Disabling set-state-in-effect
    // here because localStorage is an external system and reading it on the
    // client is the documented-valid use of this pattern.
    createLegacyBackupIfMissing();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSlotStatuses();
  }, [refreshSlotStatuses]);

  useEffect(() => {
    // Replace the SSR-stable defaults with the user's actual current month
    // and year after hydration. Runs once on mount; Date() is client-only.
    // The rule fires on the first setState in the effect body; disabling
    // because this is the documented-valid "sync from runtime-only source"
    // pattern (Date is client-only, same as localStorage above).
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartMonth(now.getMonth() + 1);
    setStartYear(now.getFullYear());
  }, []);

  const saveToSlot = useCallback(
    (slot: SlotNumber): SaveResult => {
      const v = getValues();
      // Refuse to save an invalid form. Writing empty / garbage values
      // would overwrite a previously-saved (valid) slot and look like data
      // loss to the user. safeParse is cheap — same schema the compute
      // path uses.
      const parsed = schema.safeParse(v);
      if (!parsed.success) {
        return { ok: false, reason: "Enter a valid loan amount, rate, and term before saving." };
      }
      const wrote = writeSlot(slot, {
        principal: v.principal,
        annualRate: v.annualRate,
        years: v.years,
        loanMonth: startMonth,
        loanYear: startYear,
        extraEntries,
      });
      if (!wrote) {
        return {
          ok: false,
          reason: "Your browser blocked the save (storage may be full, or this may be a private/incognito window). Your previous save was not changed.",
        };
      }
      refreshSlotStatuses();
      return { ok: true };
    },
    [extraEntries, getValues, refreshSlotStatuses, startMonth, startYear],
  );

  const loadFromSlot = useCallback(
    (slot: SlotNumber) => {
      const loan = readSlot(slot);
      if (!loan) return false;
      loadValues({
        values: {
          principal: loan.principal,
          annualRate: loan.annualRate,
          years: loan.years,
          extraPayment: "0",
        },
        apply: () => {
          setStartMonth(loan.loanMonth);
          setStartYear(loan.loanYear);
          setExtraEntries(loan.extraEntries);
          setEditingMonth(null);
        },
      });
      return true;
    },
    [loadValues],
  );

  const deleteSlot = useCallback(
    (slot: SlotNumber) => {
      clearSlot(slot);
      refreshSlotStatuses();
    },
    [refreshSlotStatuses],
  );

  // -------------------------------------------------------------------------
  // Start-date handlers
  // -------------------------------------------------------------------------

  /** Accepts an HTML `<input type="month">` value ("YYYY-MM"). */
  const handleStartDateChange = useCallback(
    (monthInputValue: string) => {
      const match = /^(\d{4})-(\d{2})$/.exec(monthInputValue);
      if (!match) return;
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return;
      setStartYear(year);
      setStartMonth(month);
    },
    [],
  );

  const startDateInputValue = `${startYear}-${String(startMonth).padStart(2, "0")}`;

  const quickAnswer = useMemo(() => {
    if (!result) return QUICK_ANSWER_DEFAULT;

    if (showSavings) {
      const flat = hasFlatExtra ? flatExtraValue : 0;
      const saved = fmtCurrency(result.interestSaved);
      const shorter = fmtMonths(result.monthsSaved);
      // Per-row entries (with or without a flat top-up) can't be summarized
      // as a single "$X per month" — loadFromSlot resets flat to $0 and
      // keeps the real plan in extraEntries, so the flat-only wording
      // would falsely claim "Adding $0.00 per month saves …".
      if (hasPerRowEntries && flat > 0) {
        return `Adding ${fmtCurrency(flat)} per month plus your per-month extras saves ${saved} in interest and shortens the payoff time by ${shorter}.`;
      }
      if (hasPerRowEntries) {
        return `Your per-month extra payments save ${saved} in interest and shorten the payoff time by ${shorter}.`;
      }
      return `Adding ${fmtCurrency(flat)} per month saves ${saved} in interest and shortens the payoff time by ${shorter}.`;
    }

    return `This loan's required monthly payment is ${fmtCurrency(result.monthlyPayment)}, and without extra payments it will cost ${fmtCurrency(result.normalTotalInterest)} in total interest over the full term.`;
  }, [result, showSavings, hasPerRowEntries, hasFlatExtra, flatExtraValue]);

  const loadExample = useCallback((example: ExampleConfig) => {
    loadValues({
      values: {
        principal: example.principal,
        annualRate: example.annualRate,
        years: example.years,
        extraPayment: example.extraPayment,
      },
      apply: () => {
        setExtraEntries([]);
        setEditingMonth(null);
      },
    });
    requestAnimationFrame(() => {
      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
    });
  }, [loadValues]);

  // Bound display helpers — consumers don't need to pass the anchor every call.
  const monthToDateBound = useCallback(
    (monthNum: number) => monthToDate(monthNum, startAnchor),
    [startAnchor],
  );
  const payoffDateBound = useCallback(
    (months: number) => payoffDate(months, startAnchor),
    [startAnchor],
  );

  return {
    state: {
      editingMonth,
      editRecurring,
      editSingle,
      showAllRows,
      startDateInputValue,
      startMonth,
      startYear,
      slotStatuses,
    },
    actions: {
      setEditRecurring,
      setEditSingle,
      startEdit,
      saveEdit,
      cancelEdit,
      clearAllEntries,
      setShowAllRows,
      handleStartDateChange,
      loadExample,
      saveToSlot,
      loadFromSlot,
      deleteSlot,
    },
    derived: {
      solutionLabel: derivedState.state.solutionLabel,
      solutionValue: derivedState.state.solutionValue,
      result,
      isStale: controller.derived.isStale,
      errors: controller.derived.errors,
      hasPerRowEntries,
      extraEntries,
      extraByMonth,
      values,
      hasExtra,
      showSavings,
      normalByMonth,
      displaySchedule,
      quickAnswer,
    },
    ui: {
      reg: controller.form.reg,
      handleBlurOrEnter: controller.form.handleBlurOrEnter,
      monthToDate: monthToDateBound,
      payoffDate: payoffDateBound,
    },
  };
}
