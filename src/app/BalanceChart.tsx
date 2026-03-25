"use client";

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

export default function BalanceChart({
  normalSchedule,
  acceleratedSchedule,
}: BalanceChartProps) {
  // Sample every N months so the chart isn't overwhelmed
  const step = Math.max(1, Math.floor(normalSchedule.length / 60));

  const data: { month: number; normal: number; accelerated: number | null }[] = [];

  for (let i = 0; i < normalSchedule.length; i += step) {
    const accRow = acceleratedSchedule[i];
    data.push({
      month: normalSchedule[i].month,
      normal: normalSchedule[i].remainingBalance,
      accelerated: accRow ? accRow.remainingBalance : null,
    });
  }

  // Ensure final points
  const lastNormal = normalSchedule[normalSchedule.length - 1];
  const lastAcc = acceleratedSchedule[acceleratedSchedule.length - 1];
  if (data[data.length - 1]?.month !== lastNormal.month) {
    data.push({
      month: lastNormal.month,
      normal: lastNormal.remainingBalance,
      accelerated: null,
    });
  }
  // Add accelerated payoff point if not already there
  if (lastAcc && !data.find((d) => d.month === lastAcc.month)) {
    const idx = data.findIndex((d) => d.month > lastAcc.month);
    const entry = {
      month: lastAcc.month,
      normal:
        normalSchedule.find((r) => r.month === lastAcc.month)
          ?.remainingBalance ?? 0,
      accelerated: lastAcc.remainingBalance,
    };
    if (idx === -1) data.push(entry);
    else data.splice(idx, 0, entry);
  }

  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="month"
            label={{ value: "Month", position: "insideBottom", offset: -2 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 12 }} width={60} />
          <Tooltip
            formatter={(value) => [
              `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            ]}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Legend verticalAlign="top" />
          <Line
            type="monotone"
            dataKey="normal"
            name="Without Extra"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="accelerated"
            name="With Extra"
            stroke="#0891b2"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
