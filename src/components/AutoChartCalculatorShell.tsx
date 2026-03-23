"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockMath } from "react-katex";
import { Breadcrumbs, type Breadcrumb } from "./Breadcrumbs";
import "katex/dist/katex.min.css";

export default function AutoChartCalculatorShell({
  id,
  title,
  latexFormula,
  srFormulaText,
  solution,
  chart,
  table,
  breadcrumbs,
  children,
}: {
  id?: string;
  title: string;
  latexFormula?: string;
  srFormulaText?: string;
  solution: string | null;
  chart?: React.ReactNode;
  table?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}) {
  return (
    <article id={id} className="max-w-3xl mx-auto space-y-8 overflow-hidden">
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="space-y-2">
          {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {latexFormula && (
            <section aria-label="Formula" className="bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-lg border text-center overflow-x-auto">
              <div aria-hidden="true"><BlockMath math={latexFormula} /></div>
              {srFormulaText && <span className="sr-only">{srFormulaText}</span>}
            </section>
          )}
          <div className="space-y-4">{children}</div>
          <section id="solution" aria-label="Result" className="mt-2">
            <div className="bg-accent/10 p-6 rounded-xl text-center border border-accent/20" aria-live="polite">
              <h2 className="text-sm font-bold text-muted-foreground uppercase mb-2">Solution</h2>
              <output className="text-3xl font-black text-accent-foreground">{solution ?? "—"}</output>
            </div>
          </section>
          {chart && (
            <section aria-label="Chart" className="overflow-hidden">
              {chart}
            </section>
          )}
          {table && (
            <section aria-label="Data Table">
              {table}
            </section>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
