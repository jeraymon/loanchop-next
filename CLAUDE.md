# LoanChop — Loan Prepayment Calculator

## Base Patterns (All Sites)

### Goals & Approach
**Project goals (in priority order):**
1. **User satisfaction** — the calculator must be fast, intuitive, and genuinely useful
2. **Traffic growth** — rank for calculator queries through SEO best practices
3. **AdSense revenue** — maximize RPM without compromising goals 1 and 2

**Expert roles:** When working on this project, apply expertise in SEO, UI/UX design, traffic acquisition, and user experience. Use modern best practices for all three goals. Prioritize decisions that serve all three — when they conflict, user satisfaction wins.

### Guardrails (Never Break)
See `AGENT.md` for the full guardrails list. Summary:
- **SEO:** Don't change canonical URL or h1 without approval. Warn if page weight exceeds 500 KB gzipped. No interstitials, hidden text, or keyword stuffing.
- **AdSense:** No ads above the fold. No more than 1 ad unit without approval. No auto-refresh ads.
- **UX:** No signup gates, paywalls, or unnecessary cookie banners. Results visible without scrolling after Calculate. Warn if LCP exceeds 2.5s.
- **Content:** All content must be original — never copy from competitors. Synthesize and rewrite research in our own voice.

### Sister Site Network
All sites share the same publisher, AdSense config, and design system. Use Related Sites sections to cross-link for SEO backlinks and user discovery:
- **dollarsperhour.com** — Weekly paycheck calculator with overtime (PRODUCTION)
- **hourlysalaries.com** — Hourly wage to salary converter
- **ajdesigner.com** — 200+ engineering and science calculators
- **bogodiscount.com** — BOGO discount calculator
- **compare2loans.com** — Side-by-side loan comparison
- **loanchop.com** — Loan prepayment calculator
- **percentoffcalculator.com** — Percent off / sale price calculator
- **percenterrorcalculator.com** — Percent error calculator
- **infantchart.com** — Baby growth percentile charts
- **optionsmath.com** — Options trading P&L calculators
- **medicalequations.com** — Medical/nursing calculators
- **rncalc.com** — RN nursing calculators
- **temperaturetool.com** — Temperature converter
- **zscorecalculator.com** — Z-score and probability calculator

### Multi-Calc vs Single-Calc Sites
- **Multi-calculator sites** (ajdesigner, infantchart, medicalequations, optionsmath, rncalc): Have sidebar navigation, breadcrumbs, calculator catalog, multiple calculator pages.
- **Single-calculator sites** (all others): No sidebar, no breadcrumbs, empty catalog, calculator at root `/`.
- **All sites** have two cross-link cards on every calculator page: "Related Calculators" (4-5 topical deeplinks, internal or external) + "Related Sites" (6 rotated home page links). No domain overlap between cards. See root CLAUDE.md Cross-Linking Rules.

### Base Key Commands
- `npx next dev --port 3000` — Start dev server
- `npx next build` — Production build (SSG export)
- `npx serve out -l 3000` — Serve the static SSG build locally (test what Amplify will serve)
- `npx vitest run` — Run tests once

### Base Tech Stack
- Next.js 15+, React 19, TypeScript, Tailwind CSS v4 (NOT v3)
- `bignumber.js` for precision math (NOT mathjs)
- `vitest` for testing
- `@tailwindcss/typography` for legal/prose pages
- Static export (SSG) hosted on AWS Amplify

### Base Key Rules
- Plain `<script>` for JSON-LD (NOT `next/script`)
- `generateMetadata()` function (NOT `export const metadata`) in page.tsx
- ShareButtons + AdSlot placed **outside** the shell, between calculator card and educational content — both wrapped in `<div className="max-w-3xl mx-auto">` to align with the card. `<ShareButtons />` must be a standalone JSX element, NOT passed as a shell prop (`afterSolution`, `table`, etc.)
- `<AdSlot />` must be wrapped in `<div className="max-w-3xl mx-auto">` to constrain ad width — unwrapped ads stretch full viewport
- `overflow-x: hidden` on html/body in globals.css, `overflow-hidden` on shell articles
- Two-column grids: `grid-cols-1 sm:grid-cols-2` (not bare `grid-cols-2`)
- Recharts lazy-loaded as entire component via `next/dynamic({ ssr: false })`
- Recharts Tooltip formatter params are NOT type-annotated
- **LaTeX formulas** must use `String.raw` backtick templates for `latexFormula` props — NOT double-backslash JSX strings (they get double-escaped in SSG and render as raw text)
- BigNumber from `bignumber.js` for precision math
- **Calculator Card Boundary:** The shell card = the calculator. Educational content lives outside the card as page text. Educational sections use light borders (`border border-slate-200`). The Related Sites/Calculators section uses a heavier bordered card (`border-2 shadow-md`). ShareButtons and AdSlot sit between card and educational content. See AGENT.md for details.
- **Card border:** Shell components use a plain `<div>` with `rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md` — do NOT use the shadcn `Card` component. See AGENT.md for details.
- **Educational headings:** Use `text-base font-semibold text-slate-600 dark:text-slate-400` — lighter than the calculator title so they don't compete visually.
- **No prose class in educational sections:** Educational `<section>` elements must NOT use `prose` or `prose-invert` Tailwind Typography classes — these create oversized headings. Use explicit utility classes only.
- **No self-links:** Related Sites/Calculators sections must NOT link to the current site's own domain.
- **Result highlight rows:** Secondary highlight rows in tables/cards (e.g., "Total", "Sale Price") use `bg-cyan-50 dark:bg-cyan-950/30` — NOT the site accent color (only the solution box uses site accent).
- **No chart overflow-hidden:** Chart wrapper divs/sections must NOT have `overflow-hidden` — this clips Recharts tooltips near chart edges.
- **Main padding:** The `<main>` element in `layout.tsx` uses `px-2 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-6` — tight on mobile, wide side margins on desktop, moderate vertical padding (not excessive top space).
- No URL parameters — calculators do not read or write query params. Share buttons share the clean base URL.
- FAQ questions must match between Calculator.tsx and page.tsx JSON-LD
- FAQ answers must always be visible — do NOT use `<details>`/`<summary>`. Use plain `<h3>` + `<p>` pairs.
- **Single `<h1>` rule:** Only one `<h1>` per page — the shell renders it. No `<h1>` in `layout.tsx`, educational sections, or other components. Single-calculator sites should have no separate header/title bar in `layout.tsx` at all (avoids wasted space and dual-h1 SEO issues).
- OpenGraph `og:image` must use an **absolute URL** (e.g., `https://www.example.com/images/og-default.jpg`)
- `alternates.canonical` must be an **absolute URL** (e.g., `https://www.example.com/slug`) — NOT a relative path like `/slug`
- `layout.tsx` must NOT call `generateMetadata()` — dynamic metadata belongs in `page.tsx` only (static `export const metadata` in `layout.tsx` is fine for site-wide defaults)
- `twitter` card metadata is **required** — every `generateMetadata()` must include `twitter: { card: "summary_large_image", title, description }`
- OpenGraph images must include `alt` text describing the calculator
- `keywords` array is **required** — include 6-8 relevant terms in every `generateMetadata()`
- Canonical URLs use `https://www.` prefix, **trailing slash on subpages** (e.g., `https://www.domain.com/slug/`), no trailing slash on homepage (e.g., `https://www.domain.com`)
- OG image (`public/images/og-default.jpg`) must be **site-specific** (branded for this site) — not a generic shared image
- Favicon: `favicon.svg` in `public/`, `apple-icon.png` (180x180 PNG) in `src/app/` (Next.js file convention). Declare favicon in `layout.tsx` `<head>` via `<link>` tag. Do NOT put `apple-icon.png` in both `src/app/` and `public/` — duplicates cause a 0 B build route
- `openGraph.url` must match `alternates.canonical` — same absolute URL, same www/trailing-slash convention
- JSON-LD `publisher` must include `name`, `url`, `logo`, and `email: "aj@ajdesigner.com"` in the Organization object
- JSON-LD `publisher.logo` must be an absolute URL pointing to `public/images/logo.png` (400x400 square PNG) — standardized filename
- All URLs in JSON-LD must be **absolute** (not relative paths)
- **All** home pages must include a standalone Organization schema with `name`, `url`, `logo`, `email`, and `sameAs` (all 14 sister site URLs)

### Documentation Rules
- `CLAUDE.md` is the quick-reference. `AGENT.md` is the single source of truth for detailed patterns.
- When adding new rules, put detail in `AGENT.md` and reference from `CLAUDE.md` — never duplicate code examples in both files.

### Troubleshooting
- **Runtime errors (500, webpack, ENOENT):** Stale `.next` cache. Run `rm -rf .next && npx next dev --port 3000`.
- **Build OOM:** Uses `NODE_OPTIONS='--max-old-space-size=4096'` in package.json.
- **Recharts Tooltip type errors:** Never type-annotate `formatter` params — use `Number(value)` inside the body.
- **JSON-LD not in static HTML:** Use plain `<script>` tag, NOT `next/script`.
- **Invisible card borders:** The shadcn `Card` component's `ring-1 ring-foreground/10` (~10% opacity) is nearly invisible. Fix: use a plain `<div>` with `border-2` — see AGENT.md.

### Ignore Patterns
- Do NOT read or index `node_modules/`

### NEVER Modify (locked values)
- **AdSense config** — The library `<script>` is in `layout.tsx` `<head>`, the ad unit `<ins>` is in `AdSlot.tsx`. Ad client/slot IDs (`ca-pub-6158058519275033`, `5439322335`) must NEVER be changed.

### Update With Caution (ask user first)
- `.devcontainer/` — only for adding dependencies
- `.gemini/` — Gemini AI config (keep in sync with project patterns)
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
- Chart appears only when extra payment > 0 (comparing normal vs accelerated payoff)

### Project Structure
- `src/app/calc.ts` — Pure math functions (BigNumber, no React): `calcMonthlyPayment`, `buildAmortization`, `compareWithAndWithoutExtra`
- `src/app/Calculator.tsx` — Client component (CalculatorShell + reactive inputs + educational content)
- `src/app/page.tsx` — Server component (generateMetadata, JSON-LD scripts)
- `src/app/BalanceChart.tsx` — Recharts line chart (lazy-loaded via next/dynamic) comparing normal vs accelerated balance
- `src/app/Calculator.test.ts` — Tests importing from calc.ts
- `src/app/calculator-catalog.ts` — Single-entry catalog (Loan Prepayment Calculator at `/`)
- `src/components/` — Shared UI (CalculatorShell, AdSlot, ShareButtons, ui/)
- `src/shared-math/` — math-config.ts (BigNumber), units.ts
- `customHttp.yml` — Amplify headers/redirects
- `legacy-php-backup/` — READ-ONLY archive
- `.claude/skills/calculator-checklist/` — Skill to validate calculator implementation

### Tech Stack (Site-Specific Additions)
- `zod` + `react-hook-form` with `watch()` + `useMemo` for reactive auto-calculation
- Base UI Select (`@base-ui/react`), NOT Radix
- `recharts` for charts (lazy-load with `next/dynamic` + `{ ssr: false }`)

### Calculator Implementation
- **Shell:** `CalculatorShell` with `bg-indigo-600` header, indigo solution box, always-visible results
- **Form pattern:** `useAutoCalculate` hook with `react-hook-form` for auto-calculate. No Calculate button, no `zodResolver`. Validation is manual via `setError`/`clearErrors`.
- **Chart:** `BalanceChart` shows remaining balance over time for normal vs accelerated schedules. Only rendered when extra payment > 0.
- **Table:** Summary cards (monthly payment, total interest, interest saved, time saved) + full amortization schedule with toggle between yearly and all-months view.
- **No formula display** — this calculator does not use react-katex (loan math is straightforward).

### Key Rules (Site-Specific)
- Auto-calculate via `useForm` + `watch()` + `useMemo` — no Calculate button, results update instantly on input change
- `zod` schema validates inputs; `schema.safeParse()` inside `useMemo` guards against invalid values
- FAQ questions must match between Calculator.tsx and page.tsx JSON-LD
- FAQ answers must always be visible — do NOT use `<details>`/`<summary>`. Use plain `<h3>` + `<p>` pairs.

### Read-Only Directories (read but NEVER modify)
- `legacy-php-backup/`, `_ui_goal/`
