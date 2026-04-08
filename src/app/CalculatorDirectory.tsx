"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { categories, totalCalculators, type Category } from "./calculator-catalog";

export function CalculatorDirectory() {
  const [query, setQuery] = useState("");
  const lowerQuery = query.toLowerCase().trim();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, []);

  const filtered: Category[] = useMemo(() => {
    if (!lowerQuery) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        calculators: cat.calculators.filter((c) =>
          c.name.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter((cat) => cat.calculators.length > 0);
  }, [lowerQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <header className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Engineering &amp; Science Calculators
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {totalCalculators}+ professional calculators for physics, engineering,
          math, and finance.
        </p>
      </header>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <input
          type="search"
          placeholder="Search calculators…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search calculators"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {/* Category jump nav */}
      {!lowerQuery && (
        <nav
          aria-label="Calculator categories"
          className="flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`#${cat.id}`}
              className="px-3 py-1.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {cat.label}
            </a>
          ))}
        </nav>
      )}

      {/* Calculator grid by category */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No calculators match &ldquo;{query}&rdquo;
        </p>
      ) : (
        filtered.map((cat, catIndex) => (
          <section key={cat.id} id={cat.id} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">
              {cat.label}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({cat.calculators.length})
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.calculators.map((calc) =>
                calc.live ? (
                  <Link
                    key={calc.name}
                    href={calc.href}
                    className="group flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800 px-4 py-3 hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <span className="size-2 shrink-0 rounded-full bg-indigo-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                      {calc.name}
                    </span>
                  </Link>
                ) : (
                  <div
                    key={calc.name}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800/50 px-4 py-3 opacity-50"
                  >
                    <span className="size-2 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <span className="text-sm text-slate-500 dark:text-slate-500">
                      {calc.name}
                    </span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-400">
                      Soon
                    </span>
                  </div>
                )
              )}
            </div>
          </section>
        ))
      )}

    </div>
  );
}
