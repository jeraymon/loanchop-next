"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export type AmortizationPoint = {
  month: number;
  interest: number;
  principal: number;
  balance: number;
};

export type PieData = {
  name: string;
  value: number;
};

const COLORS = ["#0891b2", "#e11d48"];

const currencyFormatter = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function LoanCharts({
  amortization,
  pieData,
}: {
  amortization: AmortizationPoint[];
  pieData: PieData[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || amortization.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Monthly Interest vs Principal */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Monthly Interest &amp; Principal
        </h2>
        <p className="text-sm text-muted-foreground">
          How each monthly payment splits between interest and principal over the loan term.
        </p>
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={amortization} margin={{ top: 5, right: 10, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                label={{ value: "Month", position: "insideBottom", offset: -10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={currencyFormatter}
                tick={{ fontSize: 11 }}
                label={{ value: "Amount ($)", angle: -90, position: "insideLeft", offset: -5, fontSize: 12 }}
              />
              <Tooltip
                formatter={(value, name) => [
                  currencyFormatter(value as number),
                  name === "interest" ? "Interest" : "Principal",
                ]}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Line type="monotone" dataKey="interest" stroke="#e11d48" strokeWidth={2} dot={false} name="interest" />
              <Line type="monotone" dataKey="principal" stroke="#0891b2" strokeWidth={2} dot={false} name="principal" />
              <Legend
                formatter={(value: string) => (value === "interest" ? "Interest" : "Principal")}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Remaining Balance
        </h2>
        <p className="text-sm text-muted-foreground">
          Outstanding loan balance after each monthly payment.
        </p>
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={amortization} margin={{ top: 5, right: 10, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                label={{ value: "Month", position: "insideBottom", offset: -10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={currencyFormatter}
                tick={{ fontSize: 11 }}
                label={{ value: "Balance ($)", angle: -90, position: "insideLeft", offset: -5, fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [currencyFormatter(value as number), "Balance"]}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Line type="monotone" dataKey="balance" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Total Interest vs Principal */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Total Interest vs Principal
        </h2>
        <p className="text-sm text-muted-foreground">
          Breakdown of total amount paid over the life of the loan.
        </p>
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                }
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => currencyFormatter(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
