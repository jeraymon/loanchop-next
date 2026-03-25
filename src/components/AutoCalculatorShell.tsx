"use client";
import React from "react";
import { BlockMath } from "react-katex";
import { Breadcrumbs, type Breadcrumb } from "./Breadcrumbs";
import "katex/dist/katex.min.css";

export default function AutoCalculatorShell({
  id,
  title,
  latexFormula,
  srFormulaText,
  solution,
  afterSolution,
  breadcrumbs,
  children,
}: {
  id?: string;
  title: string;
  latexFormula: string;
  srFormulaText: string;
  solution: string | null;
  afterSolution?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}) {
  return (
    <article id={id} className="max-w-3xl mx-auto space-y-8 overflow-hidden">
      <div className="rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground overflow-hidden">
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white space-y-2 px-4 sm:px-6 py-4">
          {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
          <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="px-4 sm:px-6 py-6 space-y-6">
          <section aria-label="Formula" className="bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-lg border text-center">
            <div aria-hidden="true"><BlockMath math={latexFormula} /></div>
            <span className="sr-only">{srFormulaText}</span>
          </section>
          <div className="space-y-4">{children}</div>
          <section id="solution" aria-label="Result" className="mt-2">
            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-6 rounded-xl text-center border border-indigo-200 dark:border-indigo-900" aria-live="polite">
              <h2 className="text-sm font-bold text-muted-foreground uppercase mb-2">Solution</h2>
              <output className="text-3xl font-black text-accent-foreground">{solution ?? "—"}</output>
            </div>
            {afterSolution}
          </section>
        </div>
      </div>
    </article>
  );
}
