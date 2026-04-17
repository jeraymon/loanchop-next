"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import CalculatorShell from "@/components/CalculatorShell";
import EducationalSection from "@/components/EducationalSection";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorIcon } from "@/components/ui/ErrorIcon";
import { educationalContent } from "./educationalContent";
import {
  useLoanChopCalculator,
  fmtCurrency,
  fmtMonths,
  type ExampleConfig,
} from "./useLoanChopCalculator";

const BalanceChart = dynamic(() => import("./BalanceChart"), { ssr: false });

const workedExamples: Array<{
  category: string;
  title: string;
  description: string;
  steps: string[];
  note: string;
  example: ExampleConfig;
}> = [
  {
    category: "Small Extra Payment",
    title: "What happens if you add $100/month to a 30-year mortgage?",
    description:
      "Even a modest recurring extra payment can reduce total interest and move the payoff date earlier.",
    steps: [
      "Enter a $200,000 loan at 6% for 30 years.",
      "Add an extra monthly payment of $100.",
      "The calculator rebuilds the accelerated amortization schedule.",
      "Because principal falls faster, later interest charges shrink too.",
      "The result is a shorter payoff timeline and lower lifetime interest.",
    ],
    note:
      "This is a useful starter scenario for borrowers who want to prepay without changing their budget dramatically.",
    example: {
      principal: "200000",
      annualRate: "6",
      years: "30",
      extraPayment: "100",
    },
  },
  {
    category: "Aggressive Prepayment",
    title: "How much can $300/month save on a 30-year loan?",
    description:
      "A larger recurring extra payment shows how quickly the payoff schedule compresses on a typical mortgage-sized balance.",
    steps: [
      "Enter a $250,000 loan at 6.5% for 30 years.",
      "Set the extra monthly payment to $300.",
      "The accelerated payoff path applies that extra principal every month.",
      "Interest savings accumulate because the balance stays lower throughout the loan.",
      "The summary cards show both the interest saved and the time saved.",
    ],
    note:
      "This is a common scenario for homeowners aiming to cut years off the back end of a mortgage.",
    example: {
      principal: "250000",
      annualRate: "6.5",
      years: "30",
      extraPayment: "300",
    },
  },
  {
    category: "Shorter Loan",
    title: "Does extra principal still matter on a 15-year mortgage?",
    description:
      "Shorter loans already amortize faster, but extra principal can still reduce borrowing costs and shorten the schedule further.",
    steps: [
      "Enter a $350,000 loan at 5.75% for 15 years.",
      "Add an extra payment of $500 per month.",
      "The payment schedule is already principal-heavy compared with a 30-year loan.",
      "The extra payment accelerates the balance even more in the early years.",
      "This helps you compare whether aggressive prepayment still fits your broader financial plan.",
    ],
    note:
      "This is a good planning example when deciding between faster mortgage payoff and other investment goals.",
    example: {
      principal: "350000",
      annualRate: "5.75",
      years: "15",
      extraPayment: "500",
    },
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Calculator() {
  const {
    solutionLabel,
    solutionValue,
    result,
    isStale,
    errors,
    reg,
    handleBlurOrEnter,
    hasPerRowEntries,
    extraByMonth,
    editingMonth,
    editRecurring,
    setEditRecurring,
    editSingle,
    setEditSingle,
    startEdit,
    saveEdit,
    cancelEdit,
    clearAllEntries,
    values,
    showSavings,
    showAllRows,
    setShowAllRows,
    normalByMonth,
    displaySchedule,
    startDateInputValue,
    handleStartDateChange,
    monthToDate,
    payoffDate,
    quickAnswer,
    loadExample,
    slotStatuses,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
  } = useLoanChopCalculator();
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");

  const copyResult = async () => {
    if (!solutionLabel || !solutionValue) return;
    try {
      await navigator.clipboard.writeText(`${solutionLabel} ${solutionValue}. ${quickAnswer}`);
      setCopyState("ok");
    } catch {
      setCopyState("fail");
    }
    setTimeout(() => setCopyState("idle"), 1500);
  };

  const afterSolution =
    solutionLabel && solutionValue ? (
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={copyResult}
          aria-live="polite"
          className={`text-xs font-medium transition-colors ${
            copyState === "fail"
              ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              : "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          }`}
        >
          {copyState === "ok"
            ? "Copied!"
            : copyState === "fail"
              ? "Copy failed"
              : "Copy result"}
        </button>
      </div>
    ) : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      <CalculatorShell
        id="calculator"
        title="Loan Prepayment Calculator"
        solutionLabel={solutionLabel}
        solutionValue={solutionValue}
        isStale={isStale}
        afterSolution={afterSolution}
        chart={
          result ? (
            <BalanceChart
              normalSchedule={result.normalSchedule}
              acceleratedSchedule={result.acceleratedSchedule}
              hasAcceleration={Number(values.extraPayment) > 0 || hasPerRowEntries}
            />
          ) : undefined
        }
        table={
          result ? (
            <div className="space-y-3">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              <td colSpan={11} className="px-2 py-1 text-left">
                                <div className="flex justify-start gap-1">
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
        {/* Saved loans — 3 slots, legacy-compatible localStorage keys so any
            loan saved in the old Sencha version loads here automatically. */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Saved Loans
            </h3>
            <p className="text-xs text-muted-foreground">
              Stored only in your browser — never sent anywhere.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {([1, 2, 3] as const).map((slot) => {
              const filled = slotStatuses[slot - 1];
              return (
                <div
                  key={slot}
                  className={`rounded border px-2.5 py-2 flex items-center justify-between gap-2 ${
                    filled
                      ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  }`}
                >
                  <span className="text-xs font-medium">
                    Slot {slot}
                    <span className={`ml-1 text-[10px] uppercase tracking-wide ${filled ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground"}`}>
                      {filled ? "Saved" : "Empty"}
                    </span>
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (filled && !window.confirm(`Slot ${slot} already has a saved loan. Overwrite it with the current values? (The previous save will be replaced.)`)) {
                          return;
                        }
                        const result = saveToSlot(slot);
                        if (!result.ok) {
                          window.alert(result.reason);
                        }
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 rounded px-1.5 py-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      disabled={!filled}
                      onClick={() => loadFromSlot(slot)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 rounded px-1.5 py-0.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      disabled={!filled}
                      onClick={() => {
                        if (window.confirm(`Delete the loan saved in Slot ${slot}? This cannot be undone.`)) {
                          deleteSlot(slot);
                        }
                      }}
                      className="text-xs font-medium text-red-500 hover:text-red-600 rounded px-1.5 py-0.5 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      Del
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="principal" className="inline-flex items-center gap-1.5">Loan Amount ($)<ErrorIcon show={!!errors.principal} /></Label>
            <Input
              id="principal"
              type="number"
              step="1000"
              min="0"
              placeholder="200000"
              {...reg("principal")}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="annualRate" className="inline-flex items-center gap-1.5">Annual Interest Rate (%)<ErrorIcon show={!!errors.annualRate} /></Label>
            <Input
              id="annualRate"
              type="number"
              step="0.125"
              min="0"
              placeholder="6"
              {...reg("annualRate")}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="years" className="inline-flex items-center gap-1.5">Loan Term (years)<ErrorIcon show={!!errors.years} /></Label>
            <Input
              id="years"
              type="number"
              step="1"
              min="1"
              placeholder="30"
              {...reg("years")}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startDate">First Payment Date</Label>
            <Input
              id="startDate"
              type="month"
              value={startDateInputValue}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="extraPayment" className="inline-flex items-center gap-1.5">Extra Monthly Payment ($)<ErrorIcon show={!!errors.extraPayment} /></Label>
            <Input
              id="extraPayment"
              type="number"
              step="50"
              min="0"
              placeholder="0"
              {...reg("extraPayment")}
              onBlur={handleBlurOrEnter}
              onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
              disabled={hasPerRowEntries}
            />
            {hasPerRowEntries && (
              <p className="text-xs text-muted-foreground">Disabled — using per-row entries below</p>
            )}
          </div>
        </div>
      </CalculatorShell>

      <aside
        aria-label="Quick Answer"
        className="max-w-3xl mx-auto rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 dark:bg-indigo-950/20 p-5 space-y-2"
      >
        <h2 className="text-base font-semibold text-indigo-800 dark:text-indigo-300">
          Quick Answer
        </h2>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {quickAnswer}
        </p>
      </aside>

      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Loan Prepayment Calculator" solutionLabel={solutionLabel ?? ""} solutionValue={solutionValue ?? ""} />
      </div>
      <div className="max-w-3xl mx-auto">
        <AdSlot />
      </div>

      <section className="max-w-3xl mx-auto mt-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Worked Examples
        </h2>
        <div className="space-y-4">
          {workedExamples.map((example) => (
            <article
              key={example.title}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-3"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                {example.category}
              </p>
              <h3 className="font-medium text-foreground">{example.title}</h3>
              <p>{example.description}</p>
              <ol className="list-decimal pl-5 space-y-1">
                {example.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <p>{example.note}</p>
              <button
                type="button"
                onClick={() => loadExample(example.example)}
                className="inline-flex items-center gap-1 rounded-md border border-indigo-600 px-4 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
              >
                Load this example &uarr;
              </button>
            </article>
          ))}
        </div>
      </section>

      <EducationalSection
        content={educationalContent}
        onJumpToCalculator={() => {
          document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Related Calculators */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground p-5 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
            Related Calculators
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://www.compare2loans.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Loan Comparison Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Compare two loans side by side</span>
            </li>
            <li>
              <a href="https://www.ajdesigner.com/loan/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Loan Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Calculate monthly payments and total interest</span>
            </li>
            <li>
              <a href="https://www.ajdesigner.com/mortgage-loan/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Mortgage Loan Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Estimate mortgage payments and amortization</span>
            </li>
            <li>
              <a href="https://www.ajdesigner.com/mortgage-loan-points/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Mortgage Points Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Calculate the value of buying mortgage points</span>
            </li>
            <li>
              <a href="https://www.ajdesigner.com/interest-rate/" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Interest Rate Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Solve for interest rate from loan terms</span>
            </li>
          </ul>
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
              <span className="text-muted-foreground">— Weekly paycheck calculator with overtime</span>
            </li>
            <li>
              <a href="https://www.percenterrorcalculator.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Percent Error Calculator
              </a>{" "}
              <span className="text-muted-foreground">— Measurement accuracy and percent error calculator</span>
            </li>
            <li>
              <a href="https://www.hourlysalaries.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Hourly Salaries
              </a>{" "}
              <span className="text-muted-foreground">— Hourly wage to annual salary converter</span>
            </li>
            <li>
              <a href="https://www.optionsmath.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                OptionsMath
              </a>{" "}
              <span className="text-muted-foreground">— Options trading profit and loss calculators</span>
            </li>
            <li>
              <a href="https://www.medicalequations.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Medical Equations
              </a>{" "}
              <span className="text-muted-foreground">— Clinical and medical calculators</span>
            </li>
            <li>
              <a href="https://www.cameradof.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                CameraDOF
              </a>{" "}
              <span className="text-muted-foreground">— Depth of field calculator for photographers</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
