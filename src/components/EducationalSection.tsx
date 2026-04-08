"use client";

import type { EducationalContent } from "@/types/educational";

interface EducationalSectionProps {
  content: EducationalContent;
  onJumpToCalculator: (equationType?: string, solveFor?: string) => void;
}

export default function EducationalSection({
  content,
  onJumpToCalculator,
}: EducationalSectionProps) {
  const {
    equationCards,
    howItWorks,
    exampleProblem,
    whenToUse,
    keyConcepts,
    applications,
    commonMistakes,
    faq,
    reference,
  } = content;

  return (
    <section className="max-w-3xl mx-auto mt-8 space-y-8 text-sm text-muted-foreground leading-relaxed">
      {/* Per-equation cards with scroll-to buttons */}
      {equationCards.length > 0 && (
        <div id="equations" className="space-y-4">
          {equationCards.map((card) => (
            <div
              key={card.solveFor + (card.equationType ?? "")}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-3"
            >
              <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
                {card.title}
              </h2>
              <p>{card.description}</p>
              <p className="font-medium text-foreground">{card.formula}</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 rounded-md border border-cyan-600 px-4 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950 transition-colors"
                onClick={() =>
                  onJumpToCalculator(card.equationType, card.solveFor)
                }
              >
                {card.buttonLabel} &uarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* How It Works */}
      <div
        id="how-it-works"
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          How It Works
        </h2>
        <p>{howItWorks}</p>
      </div>

      {/* Example Problem */}
      <div
        id="example"
        className="space-y-3"
      >
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Example Problem
        </h2>
        <p>{exampleProblem.setup}</p>
        <ol className="list-decimal pl-5 space-y-1">
          {exampleProblem.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        {exampleProblem.note && <p>{exampleProblem.note}</p>}
      </div>

      {/* When to Use Each Variable */}
      {whenToUse && whenToUse.length > 0 && (
        <div id="when-to-use">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">
            When to Use Each Variable
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            {whenToUse.map((item) => (
              <li key={item.solveFor}>
                <strong>{item.label}</strong> — {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Concepts */}
      {keyConcepts && (
        <div id="key-concepts">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Key Concepts
          </h2>
          <p>{keyConcepts}</p>
        </div>
      )}

      {/* Applications */}
      {applications && applications.length > 0 && (
        <div id="applications">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Applications
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {applications.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Mistakes */}
      {commonMistakes && commonMistakes.length > 0 && (
        <div id="common-mistakes">
          <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Common Mistakes
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {commonMistakes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ */}
      <div
        id="faq"
        className="space-y-5"
      >
        <h2 className="text-base font-semibold text-slate-600 dark:text-slate-400">
          Frequently Asked Questions
        </h2>
        {faq.map((item, i) => (
          <div key={i} className="space-y-1">
            <h3 className="font-medium text-foreground">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>

      {/* Reference */}
      {reference && (
        <div id="reference" className="text-xs text-muted-foreground border-t pt-4">
          <p>
            <strong>Reference:</strong> {reference}
          </p>
        </div>
      )}
    </section>
  );
}
