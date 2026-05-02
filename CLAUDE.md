## Project Status

- Single-calculator site (loan prepayment calculator at `/`).
- `useLoanChopCalculator` (the only calc hook) already adopts the Hook Closure Pattern: `compute = useStableEvent(...)`, controller via `useFormCalculatorController`, and handler-side `applyAndRecompute` / `loadValues` for transitions.
- The controller scaffold (`useFormCalculatorController`, `useObjectState`) lives in `src/lib/calculators/`. Reuse it for any new formula-based calculator added later.
- Runtime KaTeX is fully retired — the calculator does not render a LaTeX formula in the shell, and `react-katex` / `BlockMath` / `latexFormula` are not installed.
- Charts run on the shared visx family (`CalcMultiLineChart`); recharts is no longer used at runtime.

## Current Standard

- Hook return shape: `state`, `actions`, `derived`, `ui`
- Dependency-array guardrail: do not depend on whole wrapper objects like `controller.actions`; destructure stable members first
- Module-scope defaults: keep `DEFAULT_INPUTS`, `DEFAULT_FORM_VALUES`, and schemas outside the hook body
- Non-JSX hook files should use `.ts`
- Shared charts: prefer `src/components/charts/CalcLineChart`, `CalcBarChart`, and `CalcMultiLineChart` over bespoke recharts implementations when the chart fits those patterns. The on-page balance chart (`src/app/BalanceChart.tsx`) already wraps `CalcMultiLineChart`; runtime recharts is no longer imported in the calculator route.

## Network Standards In Use Here

- **Two-Line Quick Answer aside.** `Calculator.tsx` renders the cyan-bordered `<aside aria-label="Quick Answer">` between `<AdSlot />` and `<EducationalSection>`. Static line is `QUICK_ANSWER_STATIC` ("The loan prepayment calculator…"); example line is `QUICK_ANSWER_EXAMPLE` (verified $200k @ 6% / 30yr / +$100/mo arithmetic — final-month logic was hand-corrected in commits `e99b7f7` and `7fe5e22`).
- **Validator finite-check standard.** All `calc.ts` guards use `Number.isFinite(...)` rather than `!isNaN(...)`. Loan inputs are also capped (commit `7bfb87b`) so a finite-but-huge `years` value can't explode the amortization schedule.
- **Chart non-finite handling.** `BalanceChart.tsx` delegates to `CalcMultiLineChart`, which filters non-finite values before computing axis domains and falls back to `[0, 1]` on empty input.
- **AdSlot.** Self-contained wrapper (`max-w-3xl lg:max-w-[970px] mx-auto my-[50px] min-h-[280px]`) — render as bare `<AdSlot />` outside the shell. AdSense library loads in `layout.tsx` via `next/script` `strategy="lazyOnload"`.
- **Sidebar search clear control.** N/A — single-calc site, no sidebar.

## Reference

Local controller docs live in [src/lib/calculators/README.md](src/lib/calculators/README.md).
