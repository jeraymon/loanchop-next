# LoanChop — Loan Prepayment Calculator

> **SEO recovery playbook:** See `/workspace/.claude/skills/calculator-seo-recovery/SKILL.md` for the reusable playbook and `/workspace/SEO-RECOVERY.md` for per-calc status. Reference implementation: `ajdesigner.com/linear-interpolation/`.

## Base Patterns
All shared base patterns — Goals & Approach, Guardrails, Sister Site Network, Multi-Calc vs Single-Calc, Base Tech Stack, Base Key Commands, Base Key Rules (card boundary, metadata, trailing slash, cross-linking, etc.), Documentation Rules, Troubleshooting, NEVER Modify, Update With Caution — live in `/workspace/CLAUDE.md`. This file contains only site-specific overrides and additions.

---

## Site-Specific

### Palette
- **Site accent color:** `indigo-600` (header, buttons, highlights). Dark variant: `indigo-700`.
- **Solution/highlight bg:** `indigo-50` (light) / `indigo-950/30` (dark)
- **CTA buttons:** `border-indigo-600 text-indigo-600`
- **Links:** `text-indigo-600 hover:underline`

### Project Status: Active Improvement
Migration from legacy PHP to Next.js 15+ is **complete**. The calculator is functional with amortization schedule, balance chart, and prepayment comparison.

See `AGENT.md` for architecture details, coding patterns, and calculator formulas.

### Architecture
- **Single-page calculator at root `/`** — no sidebar, no internal navigation, no breadcrumbs
- Calculator files live directly in `src/app/` (calc.ts, Calculator.tsx, page.tsx, BalanceChart.tsx)
- AdSense library script is in `layout.tsx` `<head>` (plain `<script>` tag, NOT `next/script`). `AdSlot.tsx` contains only the `<ins>` tag and push call.
- Auto-calculates via `useForm` + `watch()` + `useMemo` — results, chart, and table update instantly on input change (no Calculate button)
- Chart always appears; the accelerated/extra line is hidden until an extra payment is entered

### Project Structure
- `src/app/calc.ts` — Pure math functions (BigNumber, no React): `calcMonthlyPayment`, `buildAmortization`, `compareWithAndWithoutExtra`
- `src/app/Calculator.tsx` — Client component (CalculatorShell + reactive inputs + educational content)
- `src/app/page.tsx` — Server component (generateMetadata, JSON-LD scripts)
- `src/app/BalanceChart.tsx` — Recharts line chart (lazy-loaded via next/dynamic) comparing normal vs accelerated balance
- `src/app/Calculator.test.ts` — Tests importing from calc.ts
- `src/app/calculator-catalog.ts` — Single-entry catalog (Loan Prepayment Calculator at `/`)
- `src/components/` — Shared UI (CalculatorShell, AdSlot, ShareButtons, ui/)
- `src/shared-math/` — math-config.ts (BigNumber), units.ts
- `customHttp.yml` — Custom HTTP **headers only** (X-Frame-Options, X-Content-Type-Options). Redirects live in the Amplify Console (App settings → Rewrites and redirects); version-controlled mirror at `amplify-redirects.json`.
- `amplify-redirects.json` — Version-controlled backup of Amplify Console redirect rules.
- `legacy-php-backup/` — READ-ONLY archive
- `.claude/skills/calculator-checklist/` — Skill to validate calculator implementation

### Tech Stack (Site-Specific Additions)
- `zod` + `react-hook-form` with `watch()` + `useMemo` for reactive auto-calculation
- `recharts` for charts (lazy-load with `next/dynamic` + `{ ssr: false }`)

### Calculator Implementation
- **Shell:** `CalculatorShell` with `bg-indigo-600` header, indigo solution box, always-visible results
- **Form pattern:** `useAutoCalculate` hook with `react-hook-form` for auto-calculate. No Calculate button, no `zodResolver`. Validation is manual via `setError`/`clearErrors`.
- **Chart:** `BalanceChart` shows remaining balance over time for normal vs accelerated schedules. Always rendered. The "Extra" series is suppressed when there's no acceleration, so an empty-extras loan shows just the normal balance curve.
- **Table:** Summary cards (monthly payment, total interest, interest saved, time saved) + full amortization schedule with toggle between yearly and all-months view.
- **No formula display** — this calculator does not use react-katex (loan math is straightforward).

### Key Rules (Site-Specific)
- Auto-calculate via `useForm` + `watch()` + `useMemo` — no Calculate button, results update instantly on input change
- `zod` schema validates inputs; `schema.safeParse()` inside `useMemo` guards against invalid values
- FAQ questions must match between Calculator.tsx and page.tsx JSON-LD
- FAQ answers must always be visible — do NOT use `<details>`/`<summary>`. Use plain `<h3>` + `<p>` pairs.

### Read-Only Directories (read but NEVER modify)
- `legacy-php-backup/`, `_ui_goal/`
