"use client";

import { useState, useMemo } from "react";
import CalcMultiLineChart from "@/components/charts/CalcMultiLineChart";
import type { AmortizationRow } from "./calc";

interface BalanceChartProps {
  normalSchedule: AmortizationRow[];
  acceleratedSchedule: AmortizationRow[];
  /** When false, only the "Normal" series renders — the accelerated line is
   *  suppressed because it would just overlay the normal one. */
  hasAcceleration: boolean;
}

type ChartTab =
  | "balance"
  | "totalPayments"
  | "totalInterest"
  | "totalPrincipal"
  | "monthlyInterest"
  | "monthlyPrincipal";

const TABS: { key: ChartTab; label: string }[] = [
  { key: "balance", label: "Balance" },
  { key: "totalPayments", label: "Total Payments" },
  { key: "totalInterest", label: "Total Interest" },
  { key: "totalPrincipal", label: "Total Principal" },
  { key: "monthlyInterest", label: "Monthly Interest" },
  { key: "monthlyPrincipal", label: "Monthly Principal" },
];

function getFields(tab: ChartTab): {
  normalKey: keyof AmortizationRow;
  extraKey: keyof AmortizationRow;
  yLabel: string;
} {
  switch (tab) {
    case "balance":
      return { normalKey: "remainingBalance", extraKey: "remainingBalance", yLabel: "Balance ($)" };
    case "totalPayments":
      return { normalKey: "cumulativePayment", extraKey: "cumulativePayment", yLabel: "Total Payments ($)" };
    case "totalInterest":
      return { normalKey: "cumulativeInterest", extraKey: "cumulativeInterest", yLabel: "Total Interest ($)" };
    case "totalPrincipal":
      return { normalKey: "cumulativePrincipal", extraKey: "cumulativePrincipal", yLabel: "Total Principal ($)" };
    case "monthlyInterest":
      return { normalKey: "interest", extraKey: "interest", yLabel: "Monthly Interest ($)" };
    case "monthlyPrincipal":
      return { normalKey: "principal", extraKey: "principal", yLabel: "Monthly Principal ($)" };
  }
}

export default function BalanceChart({
  normalSchedule,
  acceleratedSchedule,
  hasAcceleration,
}: BalanceChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("balance");

  const { normalKey, extraKey, yLabel } = getFields(activeTab);

  const data = useMemo(() => {
    if (normalSchedule.length === 0) return [];

    const step = Math.max(1, Math.floor(normalSchedule.length / 60));
    const points: { month: number; normal: number; extra: number | null }[] = [];

    for (let i = 0; i < normalSchedule.length; i += step) {
      const accRow = acceleratedSchedule[i];
      points.push({
        month: normalSchedule[i].month,
        normal: normalSchedule[i][normalKey] as number,
        extra: accRow ? (accRow[extraKey] as number) : null,
      });
    }

    // Ensure final normal point
    const lastNormal = normalSchedule[normalSchedule.length - 1];
    if (points[points.length - 1]?.month !== lastNormal.month) {
      points.push({
        month: lastNormal.month,
        normal: lastNormal[normalKey] as number,
        extra: null,
      });
    }

    // Ensure accelerated payoff point
    const lastAcc = acceleratedSchedule[acceleratedSchedule.length - 1];
    if (lastAcc && !points.find((d) => d.month === lastAcc.month)) {
      const idx = points.findIndex((d) => d.month > lastAcc.month);
      const normalAtMonth = normalSchedule.find((r) => r.month === lastAcc.month);
      const entry = {
        month: lastAcc.month,
        normal: normalAtMonth ? (normalAtMonth[normalKey] as number) : 0,
        extra: lastAcc[extraKey] as number,
      };
      if (idx === -1) points.push(entry);
      else points.splice(idx, 0, entry);
    }

    return points;
  }, [normalSchedule, acceleratedSchedule, normalKey, extraKey]);

  const fmt = (v: number) =>
    Number.isFinite(v)
      ? v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`
      : "Invalid";

  const series = hasAcceleration
    ? [
        {
          key: "normal",
          label: "Normal",
          color: "#94a3b8",
          connectNulls: true,
        },
        {
          key: "extra",
          label: "Extra",
          color: "#0891b2",
          connectNulls: true,
        },
      ]
    : [
        {
          key: "normal",
          label: "Normal",
          color: "#94a3b8",
          connectNulls: true,
        },
      ];

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <CalcMultiLineChart
          data={data}
          xKey="month"
          series={series}
          xLabel="Months"
          yLabel={yLabel}
          ariaLabel={`${TABS.find((tab) => tab.key === activeTab)?.label ?? "Loan"} comparison over time`}
          yTickFormat={fmt}
          tooltipFormat={(row, chartSeries) => (
            <>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>
                Month {Number(row.month)}
              </div>
              {chartSeries.map((seriesItem) => {
                const value = row[seriesItem.key];
                if (typeof value !== "number" || !Number.isFinite(value)) return null;
                return (
                  <div key={seriesItem.key}>
                    {seriesItem.label}: $
                    {value.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              })}
            </>
          )}
        />
      </div>
    </div>
  );
}
