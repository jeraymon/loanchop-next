# AJDesigner Calculator Migration

All project rules, migration workflow, and lessons learned are in:
- `CLAUDE.md` — Project overview, structure, tech stack, and migration checklist
- `AGENT.md` — Detailed migration blueprint, design system, and execution workflow

Follow both files for all tasks.

## Quick Reference for Gemini

### Project Status
- 201 calculators + 21 unit converters live, 204 test files, 1,427 tests — all passing
- All calculators have shareable URLs, cross-verified formulas, FAQPage JSON-LD
- Production build clean (SSG export to AWS Amplify)

### Golden Reference Calculators (copy these patterns)
- `src/app/density/` — **CalculatorShell** (multi-solve, unit conversions, educational content)
- `src/app/force/` — **CalculatorShell** (ShareButtons + shareable URLs reference)
- `src/app/loan/` — **ChartCalculatorShell** (button-click + amortization charts)
- `src/app/dog-age/` — **AutoChartCalculatorShell** (Recharts chart, lazy-loaded, auto-calculate)
- `src/app/length-converter/` — **AutoCalculatorShell** (auto-calculate, no button, unit converter)
- `template/_reference/` — Clean copies of all five for new projects

### Critical Rules
- Use `useForm<Record<string, string>>()` — always include the generic type
- Use plain `<script>` for JSON-LD — NOT `next/script` (invisible to crawlers in SSG)
- Export `generateMetadata()` function — NOT `export const metadata`
- Import `PI` from `@/shared-math/math-config` — never use `Math.PI` or redefine locally
- Every `<SelectValue>` must use a render function for human-readable labels
- Extract math into `calc.ts` (or `calc-*.ts` / `*-math.ts`) — NOT inline in `Calculator.tsx`
- Educational content: How It Works → Example Problem → FAQ → Related Calculators
- Two JSON-LD schemas per page: `MathSolver` (with inLanguage, publisher, potentialAction) + `FAQPage`
- `ShareButtons` + `AdSlot` placed **outside** the shell — shells contain no ad or share logic
- Shareable URLs: `useSearchParams` + `replaceState` + `Suspense` wrapper (see force calculator)
- Round-trip formula verification: if `solveX(a,b)=c`, then `solveA(c,b)` must return `a`

### Shells (choose the right one)
- `CalculatorShell` — button-click, no charts (most calculators). Has `afterSolution` prop.
- `ChartCalculatorShell` — button-click + charts/tables (loan, mortgage-loan, horsepower-elapsed-time, horsepower-trap-speed, tire-size, pay-raise, trailer-towing)
- `AutoCalculatorShell` — auto-calculate via useMemo, no charts. Has `afterSolution` prop.
- `AutoChartCalculatorShell` — auto-calculate + charts/tables (dog-age, cat-age, subwoofer)

### Validation
- Run `/calculator-checklist [slug]` (Claude skill) or manually verify against `AGENT.md`
