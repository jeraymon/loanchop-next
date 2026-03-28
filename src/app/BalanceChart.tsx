"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { AmortizationRow } from "./calc";

interface BalanceChartProps {
  normalSchedule: AmortizationRow[];
  acceleratedSchedule: AmortizationRow[];
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
}: BalanceChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("balance");

  const { normalKey, extraKey, yLabel } = getFields(activeTab);

  const data = useMemo(() => {
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
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              label={{ value: "Months", position: "insideBottom", offset: -2 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={fmt}
              tick={{ fontSize: 12 }}
              width={60}
              label={{ value: yLabel, angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11 } }}
            />
            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              ]}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend verticalAlign="top" />
            <Line
              type="linear"
              dataKey="normal"
              name="Normal"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="linear"
              dataKey="extra"
              name="Extra"
              stroke="#0891b2"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
