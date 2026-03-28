"use client";

import React, { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AutoChartCalculatorShell from "@/components/AutoChartCalculatorShell";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  compareWithAndWithoutExtra,
  type AmortizationRow,
  type ComparisonResult,
  type ExtraPaymentEntry,
} from "./calc";

const BalanceChart = dynamic(() => import("./BalanceChart"), { ssr: false });

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  principal: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .positive("Must be greater than 0")
    .max(100_000_000, "Maximum $100,000,000"),
  annualRate: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Cannot be negative")
    .max(50, "Maximum 50%"),
  years: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .int("Must be a whole number")
    .positive("Must be at least 1")
    .max(50, "Maximum 50 years"),
  extraPayment: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .min(0, "Cannot be negative")
    .max(100_000_000, "Maximum $100,000,000")
    .default(0),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtCurrency(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} year${y !== 1 ? "s" : ""}`;
  return `${y} yr${y !== 1 ? "s" : ""} ${m} mo`;
}

function payoffDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthToDate(monthNum: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + monthNum, 1);
  return `${d.getFullYear()}-${MONTH_ABBR[d.getMonth()]}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Calculator() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      principal: 200000,
      annualRate: 6,
      years: 30,
      extraPayment: 0,
    },
    mode: "onChange",
  });

  const values = watch();

  // Per-row extra payment entries (editable in the amortization table)
  const [extraEntries, setExtraEntries] = useState<ExtraPaymentEntry[]>([]);

  // Editing state for a single row
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [editRecurring, setEditRecurring] = useState("0");
  const [editSingle, setEditSingle] = useState("0");

  // Determine if per-row entries are active
  const hasPerRowEntries = extraEntries.length > 0;

  // Auto-calculate with useMemo
  const result: ComparisonResult | null = useMemo(() => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return null;
    const { principal, annualRate, years, extraPayment } = parsed.data;
    if (principal <= 0 || years <= 0) return null;
    return compareWithAndWithoutExtra(
      principal,
      annualRate,
      years,
      extraPayment,
      hasPerRowEntries ? extraEntries : undefined,
    );
  }, [values, extraEntries, hasPerRowEntries]);

  const solution = result ? `${fmtCurrency(result.monthlyPayment)}/mo` : null;
  const hasExtra =
    result &&
    (values.extraPayment > 0 || hasPerRowEntries) &&
    result.acceleratedSchedule.length < result.normalSchedule.length;
  // Also show savings cards if interest was actually saved (even if same # months)
  const showSavings =
    result &&
    (values.extraPayment > 0 || hasPerRowEntries) &&
    result.interestSaved > 0;

  const jumpToCalculator = useCallback(() => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  }, []);

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

    setExtraEntries((prev) => {
      // Remove existing entry for this month
      const next = prev.filter((e) => e.month !== editingMonth);
      // Add new entry if non-zero
      if (recurring > 0 || single > 0) {
        next.push({ month: editingMonth, recurring, single });
        next.sort((a, b) => a.month - b.month);
      }
      return next;
    });
    setEditingMonth(null);
  }, [editingMonth, editRecurring, editSingle]);

  const cancelEdit = useCallback(() => {
    setEditingMonth(null);
  }, []);

  // Clear all per-row entries
  const clearAllEntries = useCallback(() => {
    setExtraEntries([]);
    setEditingMonth(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      <AutoChartCalculatorShell
        id="calculator"
        title="Loan Prepayment Calculator"
        solution={solution}
        chart={
          result ? (
            <BalanceChart
              normalSchedule={result.normalSchedule}
              acceleratedSchedule={result.acceleratedSchedule}
            />
          ) : undefined
        }
        table={
          result ? (
            <div className="space-y-3">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Monthly Payment</p>
                  <p className="text-2xl font-bold text-foreground">{fmtCurrency(result.monthlyPayment)}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Interest</p>
                  <p className="text-2xl font-bold text-foreground">{fmtCurrency(result.normalTotalInterest)}</p>
                </div>
                {showSavings && (
                  <>
                    <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 p-4 text-center">
                      <p className="text-xs text-cyan-600 uppercase tracking-wide font-semibold">Interest Saved</p>
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{fmtCurrency(result.interestSaved)}</p>
                    </div>
                    <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 p-4 text-center">
                      <p className="text-xs text-cyan-600 uppercase tracking-wide font-semibold">Time Saved</p>
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{fmtMonths(result.monthsSaved)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Interest w/ Extra</p>
                      <p className="text-2xl font-bold text-foreground">{fmtCurrency(result.acceleratedTotalInterest)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">New Payoff Date</p>
                      <p className="text-2xl font-bold text-foreground">{payoffDate(result.acceleratedSchedule.length)}</p>
                    </div>
                  </>
                )}
                {!showSavings && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Payoff Date</p>
                    <p className="text-2xl font-bold text-foreground">{payoffDate(result.normalSchedule.length)}</p>
                  </div>
                )}
              </div>

              {/* Amortization table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Amortization Schedule — Click a Row to Add Extra Payments
                  </h3>
                  <div className="flex gap-3">
                    {hasPerRowEntries && (
                      <button
                        type="button"
                        onClick={clearAllEntries}
                        className="text-xs text-red-500 hover:text-red-600 font-medium"
                      >
                        Clear Extras
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 font-medium"
                    >
                      {showAllRows ? "Show Yearly" : "Show All Months"}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      {/* Row 1: Top-level group headers */}
                      <tr className="text-xs font-bold text-foreground">
                        <th rowSpan={3} className="bg-slate-200 dark:bg-slate-700 px-2 py-1 text-left border-r border-slate-300 dark:border-slate-600">#</th>
                        <th rowSpan={3} className="bg-slate-200 dark:bg-slate-700 px-2 py-1 text-left border-r border-slate-300 dark:border-slate-600">Date</th>
                        <th colSpan={9} className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 px-2 py-1.5 text-center border-r border-slate-300 dark:border-slate-600">Loan With Extra Payment</th>
                        <th colSpan={7} className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-2 py-1.5 text-center">Normal Payment (No Extra)</th>
                      </tr>
                      {/* Row 2: Sub-group headers */}
                      <tr className="text-xs text-muted-foreground">
                        <th colSpan={3} className="bg-indigo-50/80 dark:bg-indigo-950/20 px-2 py-1 text-center border-r border-slate-200 dark:border-slate-700">Monthly</th>
                        <th colSpan={2} className="bg-indigo-50/80 dark:bg-indigo-950/20 px-2 py-1 text-center text-red-600 dark:text-red-400 font-bold normal-case border-r border-slate-200 dark:border-slate-700">Extra Payment (Enter Below)</th>
                        <th rowSpan={2} className="bg-indigo-50/80 dark:bg-indigo-950/20 px-2 py-1 text-right border-r border-slate-200 dark:border-slate-700">Loan<br/>Balance</th>
                        <th colSpan={3} className="bg-indigo-50/80 dark:bg-indigo-950/20 px-2 py-1 text-center border-r border-slate-300 dark:border-slate-600">Total</th>
                        <th colSpan={3} className="bg-amber-50/60 dark:bg-amber-950/15 px-2 py-1 text-center border-r border-slate-200 dark:border-slate-700">Monthly</th>
                        <th rowSpan={2} className="bg-amber-50/60 dark:bg-amber-950/15 px-2 py-1 text-right border-r border-slate-200 dark:border-slate-700">Loan<br/>Balance</th>
                        <th colSpan={3} className="bg-amber-50/60 dark:bg-amber-950/15 px-2 py-1 text-center">Total</th>
                      </tr>
                      {/* Row 3: Column headers */}
                      <tr className="text-[10px] uppercase text-muted-foreground">
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right">Payment</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right">Interest</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right border-r border-slate-200 dark:border-slate-700">Principal</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right text-red-600 dark:text-red-400 font-bold">Repeating</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right text-red-600 dark:text-red-400 font-bold border-r border-slate-200 dark:border-slate-700">Single</th>
                        {/* Loan Balance rowSpan from row 2 */}
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right">Payment</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right">Interest</th>
                        <th className="bg-indigo-50/50 dark:bg-indigo-950/10 px-2 py-1 text-right border-r border-slate-300 dark:border-slate-600">Principal</th>
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right">Payment</th>
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right">Interest</th>
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right border-r border-slate-200 dark:border-slate-700">Principal</th>
                        {/* Normal Balance rowSpan from row 2 */}
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right">Payment</th>
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right">Interest</th>
                        <th className="bg-amber-50/30 dark:bg-amber-950/10 px-2 py-1 text-right">Principal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedule.map((row) => {
                        const accLen = result!.acceleratedSchedule.length;
                        const isExtraPaidOff = row.month > accLen;
                        const isEditing = !isExtraPaidOff && editingMonth === row.month;
                        const extras = extraByMonth.get(row.month);
                        const hasRowExtra = extras && (extras.recurring > 0 || extras.single > 0);
                        const normal = normalByMonth.get(row.month);
                        // For rows beyond accelerated, get the last accelerated row for "Paid off" display
                        const lastAccRow = result!.acceleratedSchedule[accLen - 1];

                        const c = "px-2 py-1 text-right tabular-nums";
                        const br = `${c} border-r border-slate-200 dark:border-slate-700`;
                        const brH = `${c} border-r border-slate-300 dark:border-slate-600`;
                        // Extra-payment side tint
                        const eC = `${c} bg-indigo-50/20 dark:bg-indigo-950/5`;
                        const eBr = `${eC} border-r border-slate-200 dark:border-slate-700`;
                        const eBrH = `${eC} border-r border-slate-300 dark:border-slate-600`;
                        // Normal side tint
                        const nC = `${c} bg-amber-50/20 dark:bg-amber-950/5`;
                        const nBr = `${nC} border-r border-slate-200 dark:border-slate-700`;

                        if (isEditing) {
                          return (
                            <tr
                              key={row.month}
                              className="border-t border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20"
                            >
                              <td className="px-2 py-1 tabular-nums font-medium">{row.month}</td>
                              <td className="px-2 py-1 text-left tabular-nums text-xs">{monthToDate(row.month)}</td>
                              <td className={eC}>{fmtCurrency(row.payment)}</td>
                              <td className={eC}>{fmtCurrency(row.interest)}</td>
                              <td className={eBr}>{fmtCurrency(row.principal)}</td>
                              <td className="px-1 py-1 bg-indigo-50/20 dark:bg-indigo-950/5">
                                <input
                                  type="number"
                                  min="0"
                                  step="50"
                                  value={editRecurring}
                                  onChange={(e) => setEditRecurring(e.target.value)}
                                  className="w-20 text-right text-sm border border-indigo-300 dark:border-indigo-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                />
                              </td>
                              <td className="px-1 py-1 bg-indigo-50/20 dark:bg-indigo-950/5 border-r border-slate-200 dark:border-slate-700">
                                <input
                                  type="number"
                                  min="0"
                                  step="100"
                                  value={editSingle}
                                  onChange={(e) => setEditSingle(e.target.value)}
                                  className="w-20 text-right text-sm border border-indigo-300 dark:border-indigo-700 rounded px-1.5 py-0.5 bg-white dark:bg-slate-900"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveEdit();
                                    if (e.key === "Escape") cancelEdit();
                                  }}
                                />
                              </td>
                              <td colSpan={11} className="px-2 py-1 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded px-2 py-0.5"
                                  >
                                    Save
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded px-2 py-0.5"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr
                            key={row.month}
                            onClick={isExtraPaidOff ? undefined : () => startEdit(row.month)}
                            className={`border-t border-slate-100 dark:border-slate-800 transition-colors ${
                              isExtraPaidOff
                                ? ""
                                : hasRowExtra
                                  ? "cursor-pointer bg-indigo-50/40 dark:bg-indigo-950/10 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                                  : "cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                            }`}
                          >
                            <td className="px-2 py-1 tabular-nums">{row.month}</td>
                            <td className="px-2 py-1 text-left tabular-nums text-xs">{monthToDate(row.month)}</td>
                            {/* Extra payment side (indigo tint) */}
                            {isExtraPaidOff ? (
                              <td colSpan={9} className="px-2 py-1 text-center text-xs text-muted-foreground bg-indigo-50/10 dark:bg-indigo-950/5 border-r border-slate-300 dark:border-slate-600">
                                Paid off — bal $0.00 | total {fmtCurrency(lastAccRow.cumulativePayment)} paid, {fmtCurrency(lastAccRow.cumulativeInterest)} interest
                              </td>
                            ) : (
                              <>
                                <td className={eC}>{fmtCurrency(row.payment)}</td>
                                <td className={eC}>{fmtCurrency(row.interest)}</td>
                                <td className={eBr}>{fmtCurrency(row.principal)}</td>
                                <td className={`${eC} text-indigo-600`}>
                                  {extras?.recurring ? fmtCurrency(extras.recurring) : "0.00"}
                                </td>
                                <td className={`${eC} text-indigo-600 border-r border-slate-200 dark:border-slate-700`}>
                                  {extras?.single ? fmtCurrency(extras.single) : "0.00"}
                                </td>
                                <td className={`${eC} font-medium border-r border-slate-200 dark:border-slate-700`}>{fmtCurrency(row.remainingBalance)}</td>
                                <td className={eC}>{fmtCurrency(row.cumulativePayment)}</td>
                                <td className={eC}>{fmtCurrency(row.cumulativeInterest)}</td>
                                <td className={eBrH}>{fmtCurrency(row.cumulativePrincipal)}</td>
                              </>
                            )}
                            {/* Normal side (amber tint) */}
                            {normal ? (
                              <>
                                <td className={nC}>{fmtCurrency(normal.payment)}</td>
                                <td className={nC}>{fmtCurrency(normal.interest)}</td>
                                <td className={nBr}>{fmtCurrency(normal.principal)}</td>
                                <td className={`${nC} font-medium border-r border-slate-200 dark:border-slate-700`}>{fmtCurrency(normal.remainingBalance)}</td>
                                <td className={nC}>{fmtCurrency(normal.cumulativePayment)}</td>
                                <td className={nC}>{fmtCurrency(normal.cumulativeInterest)}</td>
                                <td className={nC}>{fmtCurrency(normal.cumulativePrincipal)}</td>
                              </>
                            ) : (
                              <td colSpan={7} className="px-2 py-1 text-center text-xs text-muted-foreground bg-amber-50/20 dark:bg-amber-950/5">
                                Paid off
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong>Repeating</strong> payments apply from that month onward. <strong>Single</strong> payments apply to that month only. Click any row to edit.
                </p>
              </div>
            </div>
          ) : undefined
        }
      >
        {/* Form inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="principal">Loan Amount ($)</Label>
            <Input
              id="principal"
              type="number"
              step="1000"
              min="0"
              placeholder="200000"
              {...register("principal")}
              aria-invalid={!!errors.principal}
            />
            {errors.principal && (
              <p className="text-xs text-destructive">{errors.principal.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="annualRate">Annual Interest Rate (%)</Label>
            <Input
              id="annualRate"
              type="number"
              step="0.125"
              min="0"
              placeholder="6"
              {...register("annualRate")}
              aria-invalid={!!errors.annualRate}
            />
            {errors.annualRate && (
              <p className="text-xs text-destructive">{errors.annualRate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="years">Loan Term (years)</Label>
            <Input
              id="years"
              type="number"
              step="1"
              min="1"
              placeholder="30"
              {...register("years")}
              aria-invalid={!!errors.years}
            />
            {errors.years && (
              <p className="text-xs text-destructive">{errors.years.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="extraPayment">Extra Monthly Payment ($)</Label>
            <Input
              id="extraPayment"
              type="number"
              step="50"
              min="0"
              placeholder="0"
              {...register("extraPayment")}
              aria-invalid={!!errors.extraPayment}
              disabled={hasPerRowEntries}
            />
            {hasPerRowEntries && (
              <p className="text-xs text-muted-foreground">Disabled — using per-row entries below</p>
            )}
            {errors.extraPayment && (
              <p className="text-xs text-destructive">{errors.extraPayment.message}</p>
            )}
          </div>
        </div>
      </AutoChartCalculatorShell>

      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Loan Prepayment Calculator" solution={solution ?? ""} />
      </div>
      <div className="max-w-3xl mx-auto">
        <AdSlot />
      </div>

      {/* Educational content */}
      <section className="max-w-3xl mx-auto space-y-6">
        {/* How Extra Payments Work */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
            How Extra Payments Work
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you make extra payments on your loan, the additional amount goes directly
            toward reducing your principal balance. Since interest is calculated on the
            remaining balance each month, a lower balance means less interest accrues. This
            creates a compounding effect: each extra dollar paid today saves you multiple
            dollars in future interest charges. Even modest additional payments of $50 to
            $200 per month can shave years off a 30-year mortgage and save tens of thousands
            in interest.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This calculator supports two types of extra payments. <strong>Repeating</strong> payments
            apply to every month from the selected row onward — perfect for a permanent budget
            increase. <strong>Single</strong> payments apply to one specific month only — ideal
            for modeling a bonus, tax refund, or inheritance. Click any row in the amortization
            table to enter extra payment amounts.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Most lenders allow prepayment without penalties, though it is worth confirming
            with your loan servicer. Some loans have prepayment penalty clauses, particularly
            during the first few years. Federal law prohibits prepayment penalties on many
            types of mortgages originated after January 2014.
          </p>
          <button
            type="button"
            onClick={jumpToCalculator}
            className="inline-flex items-center rounded-md border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            Try the Calculator
          </button>
        </div>

        {/* Example */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
            Worked Example
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Consider a $250,000 mortgage at 6.5% for 30 years. The standard monthly payment
            is $1,580.17. Over the full term, you would pay $318,861 in interest alone,
            nearly 1.3 times the original loan amount.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By adding just $300 per month in extra payments, you would pay off the loan in
            about 21 years instead of 30, saving approximately $120,000 in total interest.
            That $300 monthly investment effectively earns a guaranteed return equivalent to
            your mortgage rate, which is difficult to match with other low-risk investments.
          </p>
          <button
            type="button"
            onClick={jumpToCalculator}
            className="inline-flex items-center rounded-md border border-indigo-600 text-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            Calculate Your Savings
          </button>
        </div>

        {/* FAQ */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Should I make extra payments or invest the money instead?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Paying down your mortgage offers a guaranteed, risk-free return equal to your
                interest rate. If your mortgage rate is 6% or higher, extra payments are often
                a strong choice. If your rate is below 4%, you might earn more by investing in
                diversified index funds over the long term, though that carries market risk.
                Consider your risk tolerance, tax situation, and whether you have an adequate
                emergency fund before deciding.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Is it better to pay extra monthly or make a lump sum payment?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Both approaches reduce your principal and save interest. A lump sum applied
                early in the loan has the largest impact because it reduces the balance when
                interest charges are highest. Monthly extra payments provide a disciplined,
                consistent approach that is easier to budget for. Mathematically, the earlier
                you apply the money, the more you save.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Do extra payments reduce my monthly payment amount?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                No. Extra payments reduce your remaining balance and shorten the loan term, but
                your required monthly payment stays the same. The benefit is that you pay off
                the loan sooner and pay significantly less total interest. If you need a lower
                monthly payment, you would need to refinance your loan.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                How do I tell my lender to apply extra payments to principal?
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Most lenders apply extra payments to principal automatically, but it is wise to
                confirm. When making your payment, look for a &quot;additional principal&quot;
                field on your statement or online portal. You can also include a note with your
                payment specifying that the extra amount should be applied to principal, not
                held for future payments.
              </p>
            </div>
          </div>
        </div>

        {/* Related Sites */}
        <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
            Related Sites
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://www.dollarsperhour.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Dollars Per Hour
              </a>{" "}
              <span className="text-muted-foreground">— Hourly wage and salary calculators</span>
            </li>
            <li>
              <a href="https://www.ajdesigner.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                AJ Designer
              </a>{" "}
              <span className="text-muted-foreground">— Engineering and science calculators</span>
            </li>
            <li>
              <a href="https://www.percentoffcalculator.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Percent Off Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Discount and percentage calculators</span>
            </li>
            <li>
              <a href="https://www.infantchart.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                InfantChart
              </a>{" "}
              <span className="text-muted-foreground">— Baby growth percentile charts</span>
            </li>
            <li>
              <a href="https://www.hourlysalaries.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Hourly Salaries
              </a>{" "}
              <span className="text-muted-foreground">— Salary conversion tools</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
