"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamic from "next/dynamic";
import BigNumber from "bignumber.js";
import { formatResult } from "@/shared-math/math-config";
import { calcMonthlyPayment as calcMP, calcLoanAmount as calcLA, calcLoanYears } from "./calc";

import ChartCalculatorShell from "@/components/ChartCalculatorShell";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/AdSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { AmortizationPoint, PieData } from "./LoanCharts";

const LoanCharts = dynamic(() => import("./LoanCharts"), { ssr: false });

const positiveNum = z.string().min(1, "Required").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number");

type SolveFor = "monthlyPayment" | "loanAmount" | "years";

const solveForLabels: Record<SolveFor, string> = {
  monthlyPayment: "Monthly Payment (M)",
  loanAmount: "Loan Amount (P)",
  years: "Loan Term (years)",
};

const schemas: Record<SolveFor, z.ZodObject<Record<string, z.ZodTypeAny>>> = {
  monthlyPayment: z.object({ P: positiveNum, rate: positiveNum, years: positiveNum }),
  loanAmount: z.object({ M: positiveNum, rate: positiveNum, years: positiveNum }),
  years: z.object({ P: positiveNum, rate: positiveNum, M: positiveNum }),
};

const formulas: Record<SolveFor, string> = {
  monthlyPayment: "M = P \\frac{r(1+r)^n}{(1+r)^n - 1}",
  loanAmount: "P = M \\frac{(1+r)^n - 1}{r(1+r)^n}",
  years: "n = \\frac{-\\ln\\left(1 - \\frac{Pr}{M}\\right)}{\\ln(1+r)}",
};

const srFormulas: Record<SolveFor, string> = {
  monthlyPayment: "Monthly payment equals principal times r times one plus r to the n divided by one plus r to the n minus one",
  loanAmount: "Loan amount equals monthly payment times one plus r to the n minus one divided by r times one plus r to the n",
  years: "Number of months equals negative natural log of one minus P times r over M divided by natural log of one plus r",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Finance & Real Estate", href: "/#finance" },
  { label: "Loan Calculator", href: "/loan" },
];

type ExtraResults = { totalInterest: string; totalPaid: string } | null;

function buildAmortizationSchedule(
  principal: number,
  monthlyRate: number,
  monthlyPayment: number,
  totalMonths: number,
): { amortization: AmortizationPoint[]; pieData: PieData[] } {
  const amortization: AmortizationPoint[] = [];
  let balance = principal;
  let totalInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
    totalInterest += interestPayment;

    amortization.push({
      month: m,
      interest: Math.round(interestPayment * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  const pieData: PieData[] = [
    { name: "Principal", value: Math.round(principal * 100) / 100 },
    { name: "Interest", value: Math.round(totalInterest * 100) / 100 },
  ];

  return { amortization, pieData };
}

export function Calculator() {
  return (
    <Suspense fallback={null}>
      <CalculatorInner />
    </Suspense>
  );
}

function CalculatorInner() {
  const searchParams = useSearchParams();
  const [solveFor, setSolveFor] = useState<SolveFor>("monthlyPayment");
  const [solution, setSolution] = useState<string | null>(null);
  const [extras, setExtras] = useState<ExtraResults>(null);
  const [chartAmortization, setChartAmortization] = useState<AmortizationPoint[]>([]);
  const [chartPieData, setChartPieData] = useState<PieData[]>([]);

  const { register, handleSubmit, formState: { errors }, reset , setValue, } = useForm<Record<string, string>>({ resolver: zodResolver(schemas[solveFor]) });

  // Load from URL params on mount
  const [paramsLoaded, setParamsLoaded] = useState(false);
  useEffect(() => {
    if (paramsLoaded) return;
    const hasParams = Array.from(searchParams.entries()).length > 0;
    if (!hasParams) { setParamsLoaded(true); return; }

    if (searchParams.get("solveFor")) setSolveFor(searchParams.get("solveFor")! as any);

    // Set form values after a tick so the form is re-rendered with the new schema
    setTimeout(() => {
      if (searchParams.get("P")) setValue("P", searchParams.get("P")!);
      if (searchParams.get("rate")) setValue("rate", searchParams.get("rate")!);
      if (searchParams.get("years")) setValue("years", searchParams.get("years")!);
      if (searchParams.get("M")) setValue("M", searchParams.get("M")!);

      // Auto-submit
      handleSubmit(onSubmit)();
    }, 100);
    setParamsLoaded(true);
  }, [searchParams, paramsLoaded]); // eslint-disable-line react-hooks/exhaustive-deps


  const onSubmit = (data: Record<string, string>) => {
    let result: BigNumber;
    let totalInterest: BigNumber | null = null;
    let totalPaid: BigNumber | null = null;

    const annualRate = new BigNumber(data.rate ?? "0");
    const r = annualRate.div(1200); // monthly rate from percentage

    // For chart data computation
    let chartPrincipal = 0;
    let chartMonthlyRate = r.toNumber();
    let chartMonthlyPayment = 0;
    let chartTotalMonths = 0;

    switch (solveFor) {
      case "monthlyPayment": {
        const P = new BigNumber(data.P);
        const n = new BigNumber(data.years).times(12);
        result = calcMP(P, annualRate, new BigNumber(data.years));
        totalPaid = result.times(n);
        totalInterest = totalPaid.minus(P);

        chartPrincipal = P.toNumber();
        chartMonthlyPayment = result.toNumber();
        chartTotalMonths = n.toNumber();
        break;
      }
      case "loanAmount": {
        const M = new BigNumber(data.M);
        const n = new BigNumber(data.years).times(12);
        result = calcLA(M, annualRate, new BigNumber(data.years));
        totalPaid = M.times(n);
        totalInterest = totalPaid.minus(result);

        chartPrincipal = result.toNumber();
        chartMonthlyPayment = M.toNumber();
        chartTotalMonths = n.toNumber();
        break;
      }
      case "years": {
        const P = new BigNumber(data.P);
        const M = new BigNumber(data.M);
        const yearsResult = calcLoanYears(P, annualRate, M);
        if (yearsResult === null) {
          setSolution("Payment too low to cover interest");
          setExtras(null);
          setChartAmortization([]);
          setChartPieData([]);
          return;
        }
        result = yearsResult;
        const nMonthsBN = result.times(12);
        totalPaid = M.times(nMonthsBN);
        totalInterest = totalPaid.minus(P);

        chartPrincipal = P.toNumber();
        chartMonthlyPayment = M.toNumber();
        chartTotalMonths = Math.ceil(nMonthsBN.toNumber());
        break;
      }
      default: return;
    }

    const prefix = solveFor === "years" ? "" : "$ ";
    const suffix = solveFor === "years" ? " years" : "";
    setSolution(`${prefix}${formatResult(result)}${suffix}`);

    if (totalInterest && totalPaid) {
      setExtras({
        totalInterest: `$ ${formatResult(totalInterest)}`,
        totalPaid: `$ ${formatResult(totalPaid)}`,
      });
    } else {
      setExtras(null);
    }

    // Build amortization schedule for charts
    if (chartPrincipal > 0 && chartMonthlyPayment > 0 && chartTotalMonths > 0) {
      const { amortization, pieData } = buildAmortizationSchedule(
        chartPrincipal,
        chartMonthlyRate,
        chartMonthlyPayment,
        chartTotalMonths,
      );
      setChartAmortization(amortization);
      setChartPieData(pieData);
    } else {
      setChartAmortization([]);
      setChartPieData([]);
    }
  

    // Update URL with shareable params
    const params = new URLSearchParams();
    params.set("solveFor", solveFor);
    if (data.P) params.set("P", data.P);
    if (data.rate) params.set("rate", data.rate);
    if (data.years) params.set("years", data.years);
    if (data.M) params.set("M", data.M);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
};

  const handleSolveForChange = (value: string | null) => {
    if (!value) return;
    setSolveFor(value as SolveFor); setSolution(null); setExtras(null); reset();
    setChartAmortization([]); setChartPieData([]);
  };

  const jumpToCalculator = useCallback((sf: SolveFor) => {
    setSolveFor(sf); setSolution(null); setExtras(null); reset();
    setChartAmortization([]); setChartPieData([]);
    setTimeout(() => { document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" }); }, 50);
  }, [reset]);

  return (
    <>
      <ChartCalculatorShell
        id="calculator" title="Loan Calculator"
        latexFormula={formulas[solveFor]} srFormulaText={srFormulas[solveFor]}
        solution={solution} breadcrumbs={breadcrumbs}
        chart={
          chartAmortization.length > 0 ? (
            <LoanCharts amortization={chartAmortization} pieData={chartPieData} />
          ) : undefined
        }
        table={
          extras ? (
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Total Interest Paid</span>
                <span className="font-mono font-semibold">{extras.totalInterest}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">Total Amount Paid</span>
                <span className="font-mono font-semibold">{extras.totalPaid}</span>
              </div>
            </div>
          ) : undefined
        }
      >
        <div className="space-y-2">
          <Label htmlFor="solve-for">Solve For</Label>
          <Select value={solveFor} onValueChange={handleSolveForChange}>
            <SelectTrigger id="solve-for"><SelectValue>{(v: string) => solveForLabels[v as SolveFor] ?? v}</SelectValue></SelectTrigger>
            <SelectContent>{(Object.keys(solveForLabels) as SolveFor[]).map((sf) => (<SelectItem key={sf} value={sf}>{solveForLabels[sf]}</SelectItem>))}</SelectContent>
          </Select>
        </div>

        {solveFor !== "loanAmount" && (
          <div className="space-y-2">
            <Label htmlFor="P">Loan Amount ($)</Label>
            <Input id="P" type="number" step="any" placeholder="Enter loan amount" {...register("P")} />
            {errors.P && <p className="text-red-500 text-sm">{errors.P.message?.toString()}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="rate">Annual Interest Rate (%)</Label>
          <Input id="rate" type="number" step="any" placeholder="e.g. 6.5" {...register("rate")} />
          {errors.rate && <p className="text-red-500 text-sm">{errors.rate.message?.toString()}</p>}
        </div>

        {solveFor !== "years" && (
          <div className="space-y-2">
            <Label htmlFor="years">Loan Term (years)</Label>
            <Input id="years" type="number" step="any" placeholder="Enter loan term" {...register("years")} />
            {errors.years && <p className="text-red-500 text-sm">{errors.years.message?.toString()}</p>}
          </div>
        )}

        {solveFor !== "monthlyPayment" && (
          <div className="space-y-2">
            <Label htmlFor="M">Monthly Payment ($)</Label>
            <Input id="M" type="number" step="any" placeholder="Enter monthly payment" {...register("M")} />
            {errors.M && <p className="text-red-500 text-sm">{errors.M.message?.toString()}</p>}
          </div>
        )}

        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handleSubmit(onSubmit)}>Calculate</Button>
      </ChartCalculatorShell>

      {/* Share buttons — outside the shell */}
      <div className="max-w-3xl mx-auto">
        <ShareButtons title="Loan Calculator" solution={solution ?? ""} />
      </div>

      {/* Ad placement — outside the shell */}
      <div className="max-w-3xl mx-auto">
        <AdSlot />
      </div>

      <section className="max-w-3xl mx-auto mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">How It Works</h2>
          <p>Loan amortization splits each monthly payment between interest and principal. Early payments are mostly interest; later payments are mostly principal. The formula ensures the loan is fully paid off by the end of the term.</p>
          <p>Enter the annual interest rate as a percentage (e.g., 6.5), the loan amount, and the term in years. The calculator shows monthly payment, total interest, and a visual amortization schedule.</p>
          <Button variant="outline" className="mt-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950" onClick={() => jumpToCalculator("monthlyPayment")}>Calculate Payment &uarr;</Button>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Example Problem</h2>
          <p>A $200,000 loan at 6.5% annual interest for 30 years.</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Monthly rate: 6.5% / 12 / 100 = 0.005417</li>
            <li>Number of payments: 30 &times; 12 = 360</li>
            <li>Monthly payment: <strong>$1,264.14</strong></li>
            <li>Total interest over 30 years: <strong>$255,089</strong></li>
          </ol>
          <p>You pay more in interest than the original loan amount. A 15-year term at the same rate gives a $1,742 payment but only $113,535 in total interest.</p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Frequently Asked Questions</h2>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How is a loan payment calculated?</h3>
            <p>The amortization formula is M = P &times; r(1+r)<sup>n</sup> / [(1+r)<sup>n</sup> &minus; 1], where r is the monthly rate and n is total payments. For a $100,000 loan at 5% for 30 years, the monthly payment is $536.82.</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">How much interest do you pay over the life of a loan?</h3>
            <p>Multiply the monthly payment by total payments, then subtract the principal. A $300,000 mortgage at 7% for 30 years costs about $418,527 in total interest &mdash; more than the original loan.</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-foreground">Does extra payment reduce total interest?</h3>
            <p>Yes. Even small extra payments reduce the principal faster, cutting total interest and the payoff timeline. Adding $100/month to a $250,000 mortgage at 6% saves about $45,000 in interest and pays off 5 years early.</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">Related Calculators</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="/mortgage-loan" className="text-cyan-600 hover:underline">Mortgage Loan Calculator</a> &mdash; dedicated mortgage payment calculator.</li>
            <li><a href="/interest-rate" className="text-cyan-600 hover:underline">Interest Rate Calculator</a> &mdash; compute simple and compound interest.</li>
            <li><a href="/loan-to-value" className="text-cyan-600 hover:underline">Loan to Value Calculator</a> &mdash; assess LTV ratio for lending.</li>
            <li><a href="/compounding-discount" className="text-cyan-600 hover:underline">Compounding &amp; Discount Factors Calculator</a> &mdash; time-value-of-money factors behind loan math.</li>
            <li><a href="/rule-of-72" className="text-cyan-600 hover:underline">Rule of 72 Calculator</a> &mdash; estimate how quickly debt doubles at a given rate.</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p><strong>Reference:</strong> Brealey, R., Myers, S., &amp; Allen, F. <em>Principles of Corporate Finance</em>. McGraw-Hill Education.</p>
        </div>
      </section>
    </>
  );
}
