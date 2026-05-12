/**
 * Two-line Quick Answer aside, rendered between AdSlot and EducationalSection
 * per the network-standard "Two-Line Quick Answer Pattern" (root CLAUDE.md).
 *
 * Replaces ~13 lines of duplicated inline JSX in every calc page. Supports
 * both pre-computed (`QUICK_ANSWER_EXAMPLE` const) and live (`{quickAnswer}`
 * from the calc hook) example strings; the "Your example:" line is only
 * rendered when `exampleAnswer` is truthy.
 *
 * The static line is the SEO anchor and must always render — that's why it
 * lives on `staticAnswer` (required) instead of falling back to the example.
 */
export default function QuickAnswerAside({
  staticAnswer,
  exampleAnswer,
}: {
  staticAnswer: string;
  exampleAnswer?: string | null;
}) {
  return (
    <aside
      className="max-w-3xl mx-auto mt-8 rounded-lg border-l-4 border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 p-4 space-y-2"
      aria-label="Quick Answer"
    >
      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase tracking-wide">
        Quick Answer
      </p>
      <p className="text-sm text-slate-800 dark:text-slate-100">{staticAnswer}</p>
      {exampleAnswer ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-800 dark:text-slate-100">Your example:</span> {exampleAnswer}
        </p>
      ) : null}
    </aside>
  );
}
