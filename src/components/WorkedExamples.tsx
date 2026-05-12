"use client";

import { useState } from "react";

export interface WorkedExample {
  /** Uppercase domain tag (e.g. "SMALL EXTRA PAYMENT"). */
  category: string;
  /** Question-style example title. */
  title: string;
  /** Brief problem setup (1-2 sentences). */
  description: string;
  /**
   * Sequential calculation steps. Rendered as a numbered `<ol>` so the
   * stepwise loan-prepayment walkthroughs read as ordered procedure, which
   * is the loanchop convention (vs. ajdesigner's bulleted-context style).
   */
  steps: readonly string[];
  /**
   * Optional bold final-result paragraph rendered below the steps. Use when
   * the answer isn't already obvious from the last step, or to lift the
   * final answer into its own line so Copy result carries it.
   */
  result?: string;
  /** Optional caveat or pedagogical footnote in smaller type. */
  note?: string;
  /** Click handler for the "Load this example" button — should preload calculator inputs. */
  onLoad: () => void;
}

/**
 * Worked examples with indigo-left-rail accent — the loanchop variant of the
 * network-wide pattern documented in the calculator-seo-recovery skill.
 *
 * Replaces ~30-50 lines of duplicated inline JSX per calc with one component
 * call that takes a typed `examples` array.
 *
 * a11y: aria-live polite status announces "Loaded example: …" after each
 * Load click; focus returns to the clicked button so keyboard users keep
 * their place.
 */
export default function WorkedExamples({
  title = "Worked Examples",
  intro,
  examples,
}: {
  title?: string;
  intro?: string;
  examples: readonly WorkedExample[];
}) {
  const [loadedTitle, setLoadedTitle] = useState("");
  const headingId = "worked-examples-heading";

  return (
    <section
      id="worked-examples"
      aria-labelledby={headingId}
      className="max-w-3xl mx-auto mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed"
    >
      <div className="space-y-2">
        <h2 id={headingId} className="text-base font-semibold text-slate-600 dark:text-slate-400">
          {title}
        </h2>
        {intro ? <p>{intro}</p> : null}
        <p role="status" aria-live="polite" className="sr-only">
          {loadedTitle ? `Loaded example: ${loadedTitle}` : ""}
        </p>
      </div>
      <div className="space-y-6">
        {examples.map((example) => (
          <article
            key={example.title}
            className="border-l-4 border-indigo-300 dark:border-indigo-700 pl-4 py-1 space-y-2"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
              {example.category}
            </p>
            <h3 className="font-medium text-foreground">{example.title}</h3>
            <p>{example.description}</p>
            <ol className="list-decimal pl-5 space-y-1">
              {example.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {example.result ? (
              <p className="font-semibold text-foreground">{example.result}</p>
            ) : null}
            {example.note ? <p className="text-xs">{example.note}</p> : null}
            <button
              type="button"
              onClick={(event) => {
                example.onLoad();
                setLoadedTitle(example.title);
                const trigger = event.currentTarget;
                window.requestAnimationFrame(() => {
                  trigger.focus({ preventScroll: true });
                });
              }}
              className="mt-1 inline-flex items-center gap-1 rounded-md border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              Load this example &uarr;
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
