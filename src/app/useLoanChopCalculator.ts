"use client";

import { useMemo, useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useAutoCalculate } from "@/hooks/useAutoCalculate";
import {
  compareWithAndWithoutExtra,
  type AmortizationRow,
  type ComparisonResult,
  type ExtraPaymentEntry,
} from "./calc";

// ---------------------------------------------------------------------------
// Schema (string-based for useAutoCalculate)
// ---------------------------------------------------------------------------

const positiveNum = z.string().min(1, "Required").refine(
  (v) => !isNaN(Number(v)) && Number(v) > 0,
  "Must be a positive number",
);
const nonNegativeNum = z.string().min(1, "Required").refine(
  (v) => !isNaN(Number(v)) && Number(v) >= 0,
  "Cannot be negative",
);
const positiveInt = z.string().min(1, "Required").refine(
  (v) => !isNaN(Number(v)) && Number(v) > 0 && Number.isInteger(Number(v)),
  "Must be a positive whole number",
);

const schema = z.object({
  principal: positiveNum,
  annualRate: nonNegativeNum,
  years: positiveInt,
  extraPayment: nonNegativeNum,
});

const schemas = { default: schema } as const;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function fmtCurrency(n: number): string {
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

export function payoffDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function monthToDate(monthNum: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + monthNum, 1);
  return `${d.getFullYear()}-${MONTH_ABBR[d.getMonth()]}`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLoanChopCalculator() {
  const [solutionLabel, setSolutionLabel] = useState<string | null>(null);
  const [solutionValue, setSolutionValue] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const {
    register,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<Record<string, string>>({
    defaultValues: {
      principal: "200000",
      annualRate: "6",
      years: "30",
      extraPayment: "0",
    },
  });

  // Per-row extra payment entries (editable in the amortization table)
  const [extraEntries, setExtraEntries] = useState<ExtraPaymentEntry[]>([]);

  // Editing state for a single row
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editRecurring, setEditRecurring] = useState("0");
  const [editSingle, setEditSingle] = useState("0");

  // Determine if per-row entries are active
  const hasPerRowEntries = extraEntries.length > 0;

  const compute = useCallback((data: Record<string, string>) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setSolutionLabel(null);
      setSolutionValue(null);
      setResult(null);
      return;
    }
    const principal = Number(data.principal);
    const annualRate = Number(data.annualRate);
    const years = Number(data.years);
    const extraPayment = Number(data.extraPayment);
    if (principal <= 0 || years <= 0) {
      setSolutionLabel(null);
      setSolutionValue(null);
      setResult(null);
      return;
    }
    const r = compareWithAndWithoutExtra(
      principal,
      annualRate,
      years,
      extraPayment,
      hasPerRowEntries ? extraEntries : undefined,
    );
    setResult(r);
    setSolutionLabel("Monthly Payment =");
    setSolutionValue(fmtCurrency(r.monthlyPayment));
  }, [hasPerRowEntries, extraEntries]);

  const { isStale, reg, handleBlurOrEnter, computeImmediate } = useAutoCalculate({
    schemas,
    solveFor: "default",
    getValues,
    register,
    setError,
    clearErrors,
    errors,
    compute,
  });

  // Re-compute when extraEntries change
  const handleExtraEntriesChange = useCallback((newEntries: ExtraPaymentEntry[]) => {
    setExtraEntries(newEntries);
    // We need to recompute after state updates, so we use a timeout
    setTimeout(() => {
      computeImmediate(getValues(), "default");
    }, 0);
  }, [computeImmediate, getValues]);

  const values = getValues();
  const hasExtra =
    result &&
    (Number(values.extraPayment) > 0 || hasPerRowEntries) &&
    result.acceleratedSchedule.length < result.normalSchedule.length;
  // Also show savings cards if interest was actually saved (even if same # months)
  const showSavings =
    result &&
    (Number(values.extraPayment) > 0 || hasPerRowEntries) &&
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

  // Build a lookup of extra entries by month for display
  const extraByMonth = useMemo(() => {
    const map = new Map<number, { recurring: number; single: number }>();
    // Resolve effective recurring for display
    let currentRecurring = 0;
    const totalMonths = result ? result.normalSchedule.length : 0;
    const recurringMap = new Map<number, number>();
    const singleMap = new Map<number, number>();
    for (const e of extraEntries) {
      if (e.recurring > 0) recurringMap.set(e.month, e.recurring);
      if (e.single > 0) singleMap.set(e.month, e.single);
    }
    for (let m = 1; m <= totalMonths; m++) {
      if (recurringMap.has(m)) currentRecurring = recurringMap.get(m)!;
      const s = singleMap.get(m) ?? 0;
      if (currentRecurring > 0 || s > 0) {
        map.set(m, { recurring: currentRecurring, single: s });
      }
    }
    return map;
  }, [extraEntries, result]);

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

  // Save the edited row
  const saveEdit = useCallback(() => {
    if (editingMonth === null) return;
    const recurring = Math.max(0, parseFloat(editRecurring) || 0);
    const single = Math.max(0, parseFloat(editSingle) || 0);

    const next = extraEntries.filter((e) => e.month !== editingMonth);
    if (recurring > 0 || single > 0) {
      next.push({ month: editingMonth, recurring, single });
      next.sort((a, b) => a.month - b.month);
    }
    setEditingMonth(null);
    handleExtraEntriesChange(next);
  }, [editingMonth, editRecurring, editSingle, extraEntries, handleExtraEntriesChange]);

  const cancelEdit = useCallback(() => {
    setEditingMonth(null);
  }, []);

  // Clear all per-row entries
  const clearAllEntries = useCallback(() => {
    setEditingMonth(null);
    handleExtraEntriesChange([]);
  }, [handleExtraEntriesChange]);

  return {
    // Solution display
    solutionLabel,
    solutionValue,
    result,
    isStale,

    // Form
    errors,
    reg,
    handleBlurOrEnter,

    // Extra payment state
    hasPerRowEntries,
    extraEntries,
    extraByMonth,

    // Editing state
    editingMonth,
    editRecurring,
    setEditRecurring,
    editSingle,
    setEditSingle,
    startEdit,
    saveEdit,
    cancelEdit,
    clearAllEntries,

    // Derived display data
    values,
    hasExtra,
    showSavings,
    showAllRows,
    setShowAllRows,
    normalByMonth,
    displaySchedule,
  };
}
