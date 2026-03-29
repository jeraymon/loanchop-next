---
name: calculator-checklist
description: Verify the loanchop.com single-calculator site follows all required patterns. No arguments needed.
allowed-tools: Read, Grep, Glob
---

Verify the single-calculator site at `src/app/` follows all required patterns. Check each item and report pass/fail:

## Base Checks (All Sites)


> **Important:** Site-Specific checks below override these Base checks where applicable. For example, auto-calculating sites use `useState`/`useMemo` instead of `useForm`/`zod`, and not all calculators display formulas. Do NOT flag site-specific patterns as Base failures.

### Files
- [ ] `Calculator.tsx` exists (client component with `"use client"`)
- [ ] `page.tsx` exists (server component with metadata)
- [ ] Test file exists (`Calculator.test.ts` with capital C). Note: Docker-on-Mac uses a case-insensitive filesystem, so `calculator.test.ts` and `Calculator.test.ts` are the same file — do NOT flag as duplicate.
- [ ] No stale files (`_temp_test.ts`, `temp_test.ts`)
- [ ] If calculator has charts: separate chart component file exists

### Shell & Design
- [ ] Uses the correct shell (`CalculatorShell`, `ChartCalculatorShell`, `AutoCalculatorShell`, or `AutoChartCalculatorShell`)
- [ ] Auto-calculating calculators use `Auto*Shell` (not a dead Calculate button on a non-auto shell)
- [ ] Shell has `id="calculator"` prop
- [ ] Formula display uses `react-katex` (`BlockMath`) — if the calculator displays a formula. Not all calculators need one (e.g., BOGO, paycheck, loan comparison).
- [ ] Shell header uses the site accent color (see CLAUDE.md Site-Specific palette) background with white bold text
- [ ] Shell header uses responsive sizing (`text-xl sm:text-2xl`, `px-4 sm:px-6`)
- [ ] Solution box uses the site accent tinting (e.g., `bg-{accent}-50 dark:bg-{accent}-950/30`), always visible (shows "—" when invalid)
- [ ] Result highlight rows in tables/summary cards (secondary highlights — e.g., "Total", "Sale Price", "Interest Saved") use `bg-cyan-50 dark:bg-cyan-950/30` — NOT the site accent color (solution box uses site accent; secondary highlights always use neutral cyan)
- [ ] Card uses a plain `<div>` (NOT shadcn `Card` component) with `rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground overflow-hidden`
- [ ] No `rounded-t-xl` on the header div
- [ ] Only ONE `<h1>` tag on the page — the shell renders the `<h1>`. No `<h1>` in `layout.tsx`, educational sections, or other components. Single-calculator sites should have NO separate header/title bar in `layout.tsx` at all. — parent's `rounded-xl overflow-hidden` clips corners automatically

### SEO & Metadata
- [ ] `page.tsx` exports `generateMetadata()` function (NOT `export const metadata`)
- [ ] Meta description is 150-165 characters (under 140 wastes SERP space, over 170 gets truncated)
- [ ] `MathSolver` JSON-LD schema present as plain `<script>` tag (NOT `next/script`)
- [ ] MathSolver JSON-LD includes `inLanguage`, `publisher` (with logo), and `potentialAction` fields
- [ ] `FAQPage` JSON-LD schema present as a second plain `<script>` tag
- [ ] FAQ questions match between JSON-LD and visible content in Calculator.tsx
- [ ] MathSolver JSON-LD `publisher` includes `name`, `url`, `logo`, and `email: "aj@ajdesigner.com"`
- [ ] MathSolver JSON-LD `publisher.logo` is an absolute URL pointing to `public/images/logo.png` (400x400 square PNG)
- [ ] All URLs in JSON-LD are **absolute** (not relative paths)
- [ ] Home page includes standalone Organization schema with `name`, `url`, `logo`, `email: "aj@ajdesigner.com"`, and `sameAs` (all 14 sister site URLs) — required on ALL sites, not just multi-calc
- [ ] Metadata includes `openGraph` with `og:image` using an **absolute URL** (e.g., `https://www.example.com/images/og-default.jpg` — not a relative path like `/images/og-default.jpg`)
- [ ] `openGraph.url` matches `alternates.canonical` (same absolute URL, same www/trailing-slash convention)
- [ ] OpenGraph image includes `alt` text describing the calculator
- [ ] Metadata includes `twitter` card: `{ card: "summary_large_image", title, description }`
- [ ] Metadata includes `keywords` array with 6-8 relevant terms
- [ ] Canonical URL has **no trailing slash**, uses `https://www.` prefix (e.g., `https://www.domain.com` not `https://domain.com`)
- [ ] OG image (`public/images/og-default.jpg`) is **site-specific** — not the generic shared image (verify file is unique to this site)
- [ ] OG image dimensions are 1200x630 and `public/images/logo.png` dimensions are 400x400
- [ ] Favicon files exist: `public/favicon.svg` (or `.ico`) and `src/app/apple-icon.png` (180x180 PNG) — apple-icon must be in `src/app/` only (Next.js file convention), NOT duplicated in `public/`
- [ ] Favicon declared in `layout.tsx` `<head>` via `<link>` tags
- [ ] `layout.tsx` does NOT call `generateMetadata()` — dynamic metadata belongs in `page.tsx` only (static `export const metadata` in `layout.tsx` is acceptable for site-wide defaults like site name and icons)

### Calculator Card Boundary
- [ ] All calculator content (header, formula, inputs, solution, charts, tables) is inside the shell card
- [ ] `<ShareButtons />` is placed **outside** the shell card as a standalone JSX element — NOT passed via `afterSolution`, `table`, or any other shell prop
- [ ] `<AdSlot />` is placed **outside** the shell card (between card and educational content)
- [ ] Educational content is rendered as a plain `<section>` **outside** the shell — NOT inside the shell component
- [ ] Educational content sections use light borders (`border border-slate-200 dark:border-slate-800`) — NOT heavy bordered cards (`border-2` or `shadow-md`) that compete with the calculator card

### Educational Content
- [ ] **Introductory/explanatory section** (e.g., "How It Works", "What Is X?", "Understanding X") with CTA button
- [ ] **Example Problem** section with worked example using real numbers
- [ ] **FAQ** section with 3-5 questions and 2-3 sentence answers
- [ ] FAQ answers are always visible — no `<details>`/`<summary>` elements. Use plain `<h3>` + `<p>` pairs.
- [ ] **Related Calculators** card (Card 1) with 4-5 topical deeplinks (internal or external) in a **bordered card** (`rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md`)
- [ ] **Related Sites** card (Card 2) with 6 home page links to sister sites in a **bordered card** (same styling as Card 1)
- [ ] No domain appears in both Card 1 and Card 2 on the same page (Google only counts the first link per domain)
- [ ] Card 2 links are rotated by page or category — not identical boilerplate across all pages
- [ ] CTA button scrolls to `#calculator` (not page top)
- [ ] Educational headings use lighter styles (`text-base font-semibold text-slate-600 dark:text-slate-400`) — NOT competing with the calculator title
- [ ] Neither Card 1 nor Card 2 self-links to the current site's own domain (self-links provide no SEO value)
- [ ] Educational sections do NOT use Tailwind Typography `prose` or `prose-invert` classes — use explicit utility classes (`text-base`, `text-sm text-muted-foreground`, etc.)

### Charts (if applicable)
- [ ] Chart component lazy-loaded via `next/dynamic` with `{ ssr: false }`
- [ ] `ResponsiveContainer` wrapped in a div with explicit height (e.g., `h-[300px]`)
- [ ] Recharts Tooltip formatter params are NOT type-annotated
- [ ] LaTeX `latexFormula` props use `String.raw` backtick templates — NOT double-backslash JSX strings (double-backslash gets double-escaped in SSG static HTML)
- [ ] Chart wrapper/section does NOT have `overflow-hidden` class (clips Recharts tooltips near chart edges)

### Share & Ads
- [ ] `ShareButtons` component placed **outside** the shell (not passed as a shell prop)
- [ ] `<ShareButtons />` wrapped in `<div className="max-w-3xl mx-auto">` — must align with the calculator card
- [ ] Share buttons are always visible (pass `solution ?? ""`, not conditional on solution existing)
- [ ] `AdSlot` placed **outside** the shell (shells have no internal AdSlot)
- [ ] `<AdSlot />` wrapped in `<div className="max-w-3xl mx-auto">` — unwrapped ads stretch full viewport width
- [ ] `layout.tsx` has AdSense library `<script>` in `<head>` (plain tag, NOT `next/script`)
- [ ] `AdSlot` contains only the `<ins>` tag and `useEffect` push call — no `<script>` tag in JSX
- [ ] AdSlot push call uses `window.adsbygoogle` (WITH `window.` prefix)
- [ ] `AdSlot` values match exactly: `data-ad-client="ca-pub-6158058519275033"`, `data-ad-slot="5439322335"`, `data-ad-format="rectangle, horizontal"`, `data-full-width-responsive="true"`. Style: `display: block, width: 100%, minWidth: 250px, minHeight: 250px`. No `overflow-hidden` on the `<aside>` container — NEVER modify these
- [ ] AdSense library `<script>` is in `layout.tsx` `<head>` (loaded once for all pages)
- [ ] `ads.txt` exists at `public/ads.txt` with correct publisher ID

### Sharing
- [ ] No `useSearchParams` or `replaceState` — calculators do not use URL parameters
- [ ] Share buttons share the clean base URL (no query params)

### Input Validation
- [ ] Division by zero cases handled gracefully (show error or prevent calculation, not silent NaN/Infinity)
- [ ] Results display user-friendly error messages (not raw "NaN" or "Infinity")

### Math Extraction
- [ ] `calc.ts` (or `calc-*.ts`) file exists with exported pure math functions (no React, no unit conversion)
- [ ] `Calculator.tsx` imports and calls functions from calc file (math NOT inline in onSubmit/useMemo)
- [ ] Tests import from calc file — NOT duplicating formulas inline
- [ ] Tests use `toBeCloseTo` for floating point comparisons

### Mobile Layout
- [ ] `<main>` element uses `px-2 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-6` — tight on mobile, wide side margins on desktop, moderate vertical padding (checked in `layout.tsx`)
- [ ] No horizontal overflow at 375px viewport width
- [ ] Two-column grids use `grid-cols-1 sm:grid-cols-2` (not `grid-cols-2` which overflows on mobile)
- [ ] Wide tables have `overflow-x-auto` wrapper

### SEO Guardrails
- [ ] Title tag and `<h1>` are aligned (both contain calculator name)
- [ ] Canonical URL is an **absolute URL** with `https://www.` prefix — NOT a relative path, NOT bare domain without www
- [ ] No interstitials, modals, or popups blocking content on load
- [ ] No hidden text or keyword stuffing techniques
- [ ] No `noindex` or `nofollow` tags present

### AdSense Guardrails
- [ ] No ads above the main content fold
- [ ] Only 1 ad unit on the page (no extras without user approval)
- [ ] No programmatic ad refresh or auto-load triggers
- [ ] Ad client/slot IDs unchanged (`ca-pub-6158058519275033`, `5439322335`)

### User Experience
- [ ] Calculator inputs respond instantly (no hydration delay)
- [ ] Calculator inputs pre-filled with sensible defaults and solution visible on page load (not empty/blank state)
- [ ] Solution string includes variable name, value, and unit (e.g., "Force (F) = 14.715 N") — not just a bare number
- [ ] Results visible without scrolling after Calculate/input change
- [ ] No signup gates, email capture, or paywalls
- [ ] No unnecessary cookie consent banners
- [ ] No auto-playing audio or video

### Content Quality
- [ ] Educational content is original — no text copied from competitor sites or scraped sources
- [ ] FAQ answers match between visible page and FAQPage JSON-LD schema
- [ ] No keyword stuffing — each section answers a distinct user question

### Performance
- [ ] Initial page load under 500 KB gzipped (excluding AdSense)
- [ ] Recharts is lazy-loaded (not in initial bundle) — if applicable
- [ ] `npx next build` succeeds with no errors
- [ ] `npx vitest run` passes all tests

Report each item as PASS or FAIL with a brief note for failures. Do NOT flag acceptable exceptions as failures — check the Site-Specific section for overrides. Summarize the total at the end.
### Pre-Deployment
- [ ] Check the live PHP site (if exists) for indexed URLs that need 301 redirects in `customHttp.yml`
- [ ] `customHttp.yml` has redirect rules for all legacy PHP pages (e.g., `/legal.php` → `/terms/`, `/index.php` → `/`)
- [ ] Verify redirects cover any URLs appearing in Google Search Console or site: search results
- [ ] All redirect destinations in `customHttp.yml` point to valid, existing routes in the app (not 404 paths)

## Site-Specific

### Files (Site-Specific)
- [ ] `calc.ts` exists with pure math functions (no React, no UI)
- [ ] Chart component file exists (`BalanceChart.tsx`)
- [ ] Chart component lazy-loaded via `next/dynamic` with `{ ssr: false }`

### Architecture (Single-Calculator Site)
- [ ] Calculator renders at root `/` (not at a sub-route)
- [ ] No sidebar imports in `layout.tsx` (`AppSidebar.tsx` and `ui/sidebar.tsx` may exist but must NOT be imported)
- [ ] No breadcrumbs in Calculator.tsx or layout.tsx
- [ ] No `CalculatorDirectory` imported in page.tsx or layout.tsx
- [ ] `layout.tsx` has NO sidebar imports or wrappers

### Shell & Design (Site-Specific)
- [ ] Uses `AutoChartCalculatorShell` (auto-calculate + chart + table, NO Calculate button)
- [ ] No `breadcrumbs` prop on the shell

### Form & Auto-Calculate
- [ ] Uses `useForm<FormValues>` with `zodResolver(schema)` and `mode: "onChange"`
- [ ] Uses `watch()` to read all form values reactively
- [ ] Results derive from `useMemo` that calls `schema.safeParse(values)` — recalculate instantly on any input change
- [ ] No Calculate button — auto-calculate pattern
- [ ] Uses `BigNumber` from `bignumber.js` for math (not native JS floats)
- [ ] Form inputs use `register()` from react-hook-form
- [ ] Validation errors displayed via `errors` from `formState`
- [ ] Two-column layout: `grid-cols-1 sm:grid-cols-2` for input fields

### Calculator Logic
- [ ] `calc.ts` exports `calcMonthlyPayment()` with BigNumber precision
- [ ] `calc.ts` exports `buildAmortization()` for amortization schedule generation
- [ ] `calc.ts` exports `compareWithAndWithoutExtra()` comparing normal vs accelerated schedules
- [ ] 0% interest rate edge case handled (simple division of principal / months)
- [ ] Summary cards show: Monthly Payment, Total Interest, Payoff Date
- [ ] When extra payment > 0: additional cards show Interest Saved, Time Saved, Interest w/ Extra, New Payoff Date
- [ ] Interest Saved and Time Saved cards highlighted with cyan tinting
- [ ] Amortization table with toggle between yearly snapshots and all-months view
- [ ] Amortization table has `overflow-x-auto` wrapper

### SEO & Metadata (Site-Specific)
- [ ] FAQ questions match between JSON-LD and visible content
- [ ] Canonical URL set to `https://www.loanchop.com/`

### Calculator Card Boundary (Site-Specific)
- [ ] All calculator content (header, inputs, summary cards, amortization table, balance chart) is inside the shell card

### Educational Content (Site-Specific)
- [ ] **How Extra Payments Work** section — plain text or light bordered card with CTA button ("Try the Calculator")
- [ ] **Worked Example** section — worked example with real numbers ($250,000 at 6.5%, $300/mo extra)
- [ ] **FAQ** section — 4 questions with detailed answers (plain text or light bordered div)
- [ ] **Related Sites** section — 5 links to external sister sites in a bordered card
  - Should include: dollarsperhour.com, ajdesigner.com, percentoffcalculator.com, infantchart.com, hourlysalaries.com
  - Format: `[SiteName.com](url) — one-sentence description`
- [ ] CTA buttons scroll to `#calculator` (not page top)

### Charts (Site-Specific)
- [ ] Chart shows **Remaining Balance vs Month** comparing normal and accelerated schedules
- [ ] Chart X-axis: "Month", lines: "Without Extra" (slate) and "With Extra" (cyan)
- [ ] Chart only rendered when extra payment > 0
- [ ] `ResponsiveContainer` wrapped in a div with explicit height (`h-[300px]`)

### Input Validation (Site-Specific)
- [ ] Division by zero handled (0% interest rate produces valid result via simple division)
- [ ] Zero extra payment produces standard amortization (no chart, no savings cards)
- [ ] Invalid inputs produce null result (solution shows "—", no chart/table rendered)

### Mobile Layout (Site-Specific)
- [ ] Input fields use `grid-cols-1 sm:grid-cols-2` (not bare `grid-cols-2`)
- [ ] Summary cards use `grid-cols-1 sm:grid-cols-2`
- [ ] Amortization table has `overflow-x-auto` wrapper

### Tests (Site-Specific)
- [ ] Tests cover: standard loan (30yr $200k @ 6%)
- [ ] Tests cover: different terms (15yr $200k @ 5%)
- [ ] Tests cover: 0% interest rate edge case
- [ ] Tests cover: extra payments reduce total interest and months
- [ ] Tests use `toBeCloseTo` for floating point comparisons
- [ ] Tests import from `calc.ts` (not duplicating formulas)

### Content Quality
- [ ] Educational content covers how extra payments work (principal reduction, compounding effect)
- [ ] Worked example uses real numbers that users can verify
- [ ] FAQ covers common questions (invest vs prepay, lump sum vs monthly, payment amount unchanged, how to instruct lender)

Report each item as PASS or FAIL with a brief note for failures. Summarize the total at the end.
