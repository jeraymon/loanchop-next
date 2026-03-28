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
  ReferenceDot,
} from "recharts";

export type ChartPoint = { calendarAge: number; dogAge: number };

export default function DogAgeChart({
  data,
  markerX,
  markerY,
}: {
  data: ChartPoint[];
  markerX?: number;
  markerY?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="calendarAge"
          type="number"
          ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]}
          label={{ value: "Calendar Years", position: "insideBottom", offset: -10, fontSize: 12 }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="number"
          label={{ value: "Human Years", angle: -90, position: "insideLeft", offset: -5, fontSize: 12 }}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value) => [`${value} human years`, "Dog Age"]}
          labelFormatter={(label) => `${label} calendar years`}
        />
        <Line
          type="monotone"
          dataKey="dogAge"
          stroke="#0891b2"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, fill: "#0891b2" }}
        />
        {markerX != null && markerY != null && (
          <ReferenceDot
            x={markerX}
            y={markerY}
            r={7}
            fill="#e11d48"
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
