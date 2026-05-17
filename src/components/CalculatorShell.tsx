"use client";
import React from "react";

export default function CalculatorShell({
  id,
  title,
  solutionLabel,
  solutionValue,
  isStale,
  afterSolution,
  chart,
  table,
  children,
}: {
  id?: string;
  title: string;
  solutionLabel?: string | null;
  solutionValue?: string | null;
  isStale?: boolean;
  afterSolution?: React.ReactNode;
  chart?: React.ReactNode;
  table?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article id={id} className="max-w-6xl mx-auto space-y-4 sm:space-y-6 overflow-hidden">
      <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground overflow-hidden">
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white space-y-2 px-4 sm:px-6 py-2 sm:py-3">
          <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>{children}</form>
          <section aria-label="Result" className="mt-2">
            <div className={`bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl text-center border border-indigo-200 dark:border-indigo-900 ${isStale ? "opacity-50" : "opacity-100"} transition-opacity duration-200`} aria-live="polite">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{solutionLabel ?? "Solution"}</h2>
              <output className="text-2xl sm:text-3xl font-black text-accent-foreground">{solutionValue ?? "—"}</output>
            </div>
            {afterSolution && (
              <div className={`transition-opacity duration-200 ${isStale ? "opacity-50" : "opacity-100"}`}>
                {afterSolution}
              </div>
            )}
          </section>
          {chart && (
            <section aria-label="Chart" className={`transition-opacity duration-200 ${isStale ? "opacity-50" : "opacity-100"}`}>
              {chart}
            </section>
          )}
          {table && (
            <section aria-label="Data Table" className={`transition-opacity duration-200 ${isStale ? "opacity-50" : "opacity-100"}`}>
              {table}
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
