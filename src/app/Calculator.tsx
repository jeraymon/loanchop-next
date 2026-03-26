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
import { compareWithAndWithoutExtra, type ComparisonResult } from "./calc";

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

  // Auto-calculate with useMemo
  const result: ComparisonResult | null = useMemo(() => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return null;
    const { principal, annualRate, years, extraPayment } = parsed.data;
    if (principal <= 0 || years <= 0) return null;
    return compareWithAndWithoutExtra(principal, annualRate, years, extraPayment);
  }, [values]);

  const solution = result ? `${fmtCurrency(result.monthlyPayment)}/mo` : null;
  const hasExtra = result && values.extraPayment > 0;

  const jumpToCalculator = useCallback(() => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Amortization table (scrollable, shows every 12th month by default)
  const [showAllRows, setShowAllRows] = useState(false);
  const displaySchedule = useMemo(() => {
    if (!result) return [];
    const sched = hasExtra ? result.acceleratedSchedule : result.normalSchedule;
    if (showAllRows) return sched;
    return sched.filter((r) => r.month % 12 === 0 || r.month === 1 || r.month === sched.length);
  }, [result, hasExtra, showAllRows]);

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
          result && hasExtra ? (
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
                {hasExtra && (
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
                {!hasExtra && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Payoff Date</p>
                    <p className="text-2xl font-bold text-foreground">{payoffDate(result.normalSchedule.length)}</p>
                  </div>
                )}
              </div>

              {/* Amortization table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Amortization Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAllRows(!showAllRows)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 font-medium"
                  >
                    {showAllRows ? "Show Yearly" : "Show All Months"}
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-left text-xs uppercase text-muted-foreground">
                        <th className="px-3 py-2">Month</th>
                        <th className="px-3 py-2 text-right">Payment</th>
                        <th className="px-3 py-2 text-right">Interest</th>
                        <th className="px-3 py-2 text-right">Principal</th>
                        {hasExtra && <th className="px-3 py-2 text-right">Extra</th>}
                        <th className="px-3 py-2 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedule.map((row) => (
                        <tr
                          key={row.month}
                          className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                        >
                          <td className="px-3 py-1.5 tabular-nums">{row.month}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{fmtCurrency(row.payment)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{fmtCurrency(row.interest)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{fmtCurrency(row.principal)}</td>
                          {hasExtra && (
                            <td className="px-3 py-1.5 text-right tabular-nums text-indigo-600">{fmtCurrency(row.extraPrincipal)}</td>
                          )}
                          <td className="px-3 py-1.5 text-right tabular-nums font-medium">{fmtCurrency(row.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            />
            {errors.extraPayment && (
              <p className="text-xs text-destructive">{errors.extraPayment.message}</p>
            )}
          </div>
        </div>
      </AutoChartCalculatorShell>

      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Loan Prepayment Calculator" solution={solution ?? ""} />
      </div>
      <AdSlot />

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
