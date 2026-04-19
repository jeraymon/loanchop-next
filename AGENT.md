# [SYSTEM_DIRECTIVE]: DO NOT SUMMARIZE, TRUNCATE, OR MODIFY THIS FILE.
# LoanChop (loanchop.com): Architecture & Coding Patterns
> **Status:** Live — 1 calculator (Loan Prepayment Calculator). Improvement/maintenance phase.
> **Constraint Level:** Absolute (Must apply to all changes)

## Shared Conventions
See `/workspace/CLAUDE.md` for all base patterns, conventions, and guardrails that apply across all 15 sites. This file only contains `loanchop`-specific overrides, site-unique subsystems, and lessons learned.

## Site-Specific

### SECTION 1: DESIGN SYSTEM & UI
- **Palette:** `indigo-600` (Shell header / accents), `indigo-50` (Solution box / highlight cards), `zinc-50` (Backgrounds), `slate-700` (Secondary text).
- **Shell:** Uses `CalculatorShell` — no Calculate button, results derive from `useForm` + `watch()` + `useMemo` and update instantly on every input change. Solution always visible (shows "—" when inputs are invalid).
- **Aesthetic:** "Engineering Laboratory" - high contrast, clean, no gradients.
- **Navigation:** Single-calculator site — no sidebar, no internal navigation. Footer has legal page links only.
- **Summary cards:** Interest Saved and Time Saved highlighted with cyan tinting (`border-cyan-200 bg-cyan-50`). Other summary cards use standard slate borders.
- **Amortization table:** Toggle between yearly snapshots and all-months view. Columns: Month, Payment, Interest, Principal, Extra (when applicable), Balance.
- **No formula display** — loan math is presented inline in educational content as plain text. Runtime KaTeX was removed April 2026 (`d0d6630`) and the `latexFormula` shell props purged.

### SECTION 2: ARCHITECTURAL STANDARDS (Site-Specific)
- **Auto-calculate pattern (this site):** Uses `zod` + `react-hook-form` with `mode: "onChange"` and `watch()` to read all form values reactively. Results derive from `useMemo` that calls `schema.safeParse(values)` — if validation fails, result is null and solution shows "—". No Calculate button. This is a hybrid approach: zod handles validation display, useMemo handles reactive calculation.
- **Validation:** Use `zod` + `react-hook-form`. All inputs must be numeric. Strictly prevent division-by-zero errors.
- **OUTPUT ZONE:** Single-calculator site — calculator files live directly in `src/app/`.

### SECTION 6: EXECUTION WORKFLOW
**When developing the calculator:**
1. ANALYZE the calculator requirements — variables, math formulas, and unit multipliers.
2. CREATE `calc.ts` with pure math functions, `Calculator.tsx` with UI, and `page.tsx` with metadata in `src/app/`.
3. VERIFY a11y, Zod logic, and color applications (`cyan-600` for Calculate button, `slate-600`/`slate-400` for educational headings).
4. ADD any unit categories to `src/shared-math/units.ts` if the calculator requires units not yet ported.
5. WRITE tests in `Calculator.test.ts`. Test each "Solve For" variant with known inputs and approximate equality.
6. RUN `npx vitest run` and fix any failures.
7. RUN `npm run build` to verify the production build succeeds.

**When updating or fixing live UI components:**
1. READ the existing calculator code as the reference.
2. APPLY code fixes to `src/` files while preserving the established patterns.

### Related Sites (Cross-Site Linking)
Every calculator's educational content ends with a **Related Sites** bordered card containing 4-6 external links to sister sites:
- [Dollars Per Hour](https://www.dollarsperhour.com) — Hourly wage and salary calculators
- [AJ Designer](https://www.ajdesigner.com) — Engineering and science calculators
- [Percent Off Calculator](https://www.percentoffcalculator.com) — Discount and percentage calculators
- [LoanChop](https://www.loanchop.com) — Loan and mortgage calculators
- [InfantChart](https://www.infantchart.com) — Baby growth percentile charts
- [Hourly Salaries](https://www.hourlysalaries.com) — Salary conversion tools

**Link format:** `[Site Name](https://url) — one-sentence description.`

# [END_DIRECTIVE]
