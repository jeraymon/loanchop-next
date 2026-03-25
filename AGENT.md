# [SYSTEM_DIRECTIVE]: DO NOT SUMMARIZE, TRUNCATE, OR MODIFY THIS FILE.
# LoanChop (loanchop.com): Architecture & Coding Patterns
> **Status:** Live — 1 calculator (Loan Prepayment Calculator). Improvement/maintenance phase.
> **Constraint Level:** Absolute (Must apply to all changes)

## Base Patterns (All Sites)
## BASE SECTION 1: DESIGN SYSTEM & UI (All Sites)
- **Shell header:** `bg-cyan-600 dark:bg-cyan-700` with white text, responsive padding (`px-4 sm:px-6`), responsive title (`text-xl sm:text-2xl font-bold text-white`).
- **Solution box:** `bg-cyan-50 dark:bg-cyan-950/30` with `border-cyan-200 dark:border-cyan-800`. Cyan "SOLUTION" label with large result text. Always visible (shows "—" when empty/invalid).
- **Card:** `border-slate-300 dark:border-slate-700 shadow-md` — stronger than default for visual weight.
- **Dark Mode:** Must fully support `next-themes` via Tailwind `dark:` classes.
- **Playwright screenshots:** Save to `.playwright-screenshots/` directory (gitignored). Use `filename: ".playwright-screenshots/name.png"` when taking screenshots.

## BASE SECTION 2: ARCHITECTURAL STANDARDS (All Sites)
- **Framework:** Next.js 15+ App Router.
- **Shell:** Every page must export a default function wrapped in one of four shells:
  - `CalculatorShell` — button-click calculate, no charts (most calculators)
  - `ChartCalculatorShell` — button-click calculate + charts/tables
  - `AutoCalculatorShell` — auto-calculate on input change, no charts. Results derive from `useMemo`, no Calculate button. Solution always visible (shows "—" when empty).
  - `AutoChartCalculatorShell` — auto-calculate on input change + charts/tables. Same reactive pattern with chart/table props.
  Chart shells accept `chart` and `table` props (`ReactNode`) rendered below the solution inside the same card. For multiple charts or tables, wrap them in a fragment: `chart={<><Chart1 /><Chart2 /></>}`. Formula display is optional in chart shells. Auto shells use a `<div>` instead of `<form>` and include an `id="solution"` anchor for CTA scroll targeting.
  **`afterSolution` prop:** Available on `CalculatorShell` and `AutoCalculatorShell` only (NOT on chart shells). Use for conversion tables or supplementary result data.
  **Ads and Share buttons:** All shells have NO internal `<AdSlot />` or `<ShareButtons />`. These are placed outside the shell in each `Calculator.tsx`.
  **`ShareButtons` interface:** `title: string` (calculator name), `solution: string` (pass `solution ?? ""` so buttons are always visible).
- **Math Engine:** Strictly use `@/shared-math/math-config` (`bignumber.js` with 64-digit decimal precision).
- **Testing:** Use `vitest`. Every calculator must have a `Calculator.test.ts` file that imports from `calc.ts` and tests its formulas with known inputs/outputs using approximate equality (`toBeCloseTo`). Run `npx vitest run` to verify before considering the work complete.
- **Formula Verification:** Every calc.ts function must pass round-trip consistency tests — if `solveX(a, b) = c`, then `solveA(c, b)` must return `a`. Test with at least 2 input sets per function. For new calculators, verify at least one result against an external reference (Wolfram Alpha, textbook, NIST).

## BASE SECTION 3: REVENUE & SEO (All Sites)
- **Ad Placement:** `<AdSlot />` is placed **outside** the shell component, not inside it. Each `Calculator.tsx` renders AdSlot directly after the shell and ShareButtons. Ads must be always visible on page load (not gated behind a Calculate click) for AdSense policy compliance.
- **Ad Code (LOCKED — NEVER modify):** The AdSense implementation is split across two files: (1) `layout.tsx` has the library `<script async src="...adsbygoogle.js?client=ca-pub-6158058519275033" crossOrigin="anonymous" />` in the `<head>` — this is a plain `<script>` tag (NOT `next/script`), which renders into static HTML at build time for SSG. (2) `AdSlot.tsx` has the `<ins>` tag with ad attributes and a `useEffect` that calls `(window.adsbygoogle = window.adsbygoogle || []).push({})`. The `<script>` tag must NOT be inside AdSlot JSX (React strips `<script>` tags from JSX). Values: `data-ad-client="ca-pub-6158058519275033"`, `data-ad-slot="5439322335"`, `data-ad-format="rectangle, horizontal"`, `data-full-width-responsive="true"`. Style: `display: block, width: 100%, minWidth: 250px, minHeight: 250px`. No `overflow-hidden` on the `<aside>` container. Do NOT change any of these values.
- **Ad Protection:** The `<aside>` container must NOT have `overflow-hidden` (AdSense bots reject clipped containers to protect the AdChoices icon). The `<ins>` tag uses explicit dimensions (`width: 100%`, `minWidth: 250px`, `minHeight: 250px`) to prevent collapse when unfilled. Maintain a 50px vertical margin (`my-[50px]`). UI elements MUST NOT overlap this zone. The index page has NO ads.
- **Redirects:** Add redirect rules to `customHttp.yml` for AWS Amplify (since Next.js `redirects()` is dead code with `output: 'export'`).
- **Metadata:** Export `generateMetadata()` (NOT `export const metadata`) with unique titles, descriptions, canonical URLs, and OpenGraph tags (including `og:image` pointing to `/images/og-default.jpg` — 1200x630). Inject **two** JSON-LD schemas via plain `<script>` tags with `type="application/ld+json"` and `dangerouslySetInnerHTML`:
  1. **`MathSolver`** — includes `inLanguage: "en"`, `publisher` (Organization with logo), `potentialAction` (SolveMathAction with EntryPoint and query-input)
  2. **`FAQPage`** — `mainEntity` array of `Question`/`Answer` pairs matching the FAQ section in Calculator.tsx
  Do NOT use `next/script` (`<Script>`) — it injects at runtime via JS, which means the JSON-LD is invisible to crawlers in SSG (`output: 'export'`). Also do NOT use `metadata.other` (renders as `<meta>` instead of `<script>`).
- **SEO Files:** `public/robots.txt` (allows all crawlers, points to sitemap) and `public/sitemap.xml` (auto-generated). The `prebuild` script (`scripts/generate-sitemap.mjs`) reads `calculator-catalog.ts` and writes `sitemap.xml` automatically — no manual edits needed. It runs before every `npm run build`.

## BASE SECTION 4: MATH, UNITS & A11Y (All Sites)
- **Math Display:** Translate legacy image equations to `react-katex`. Pre-render to eliminate layout flicker. Use `<BlockMath />` for primary formulas.
- **Result Precision:** `formatResult()` displays 8 significant digits and uses scientific (e) notation for values ≥1e12 or <1e-4.
- **Legacy Images:** Replace formula images with `react-katex`. Replace simple diagrams/tables with HTML/CSS (better for a11y, SEO, and dark mode). Only keep images for complex visuals that can't be reasonably recreated — place those in `public/images/` with descriptive `alt` text.
- **Symbols:** Convert plain text carets (`^`) and underscores (`_`) to KaTeX/Unicode equivalents in UI labels.
- **Unit Dropdowns:** Format labels as "Name (Symbol)" (e.g., `meter^3` becomes `Meter (m³)`).
- **Unit Values:** The `value` attribute of dropdown options MUST be the unit key string from `units.ts` (e.g., `"kilogram"`, `"meter^3"`). Conversion factors are looked up internally — never use raw numeric multipliers as values.
- **Screen Readers (a11y):** Math formulas must have a `.sr-only` English description. Wrap results in an `<output>` tag with `aria-live="polite"`.
- **Navigation a11y:** Footer legal links use semantic `<nav>` with `aria-label`.

## BASE SECTION 5: WORKSPACE BOUNDARIES (All Sites)
- **IMMUTABLE FILES (DO NOT TOUCH OR EDIT):**
  - `legacy-php-backup/` (STRICTLY READ-ONLY. DO NOT MODIFY LEGACY PHP FILES)
  - `_ui_goal/` (STRICTLY READ-ONLY REFERENCE. DO NOT MODIFY.)
- **UPDATE WITH CAUTION (ask user first):**
  - `.devcontainer/` (Dockerfile, docker-compose.yml — only for adding dependencies like Playwright)
  - `.gemini/` (Gemini AI config — keep in sync with project patterns)
- **CONFIG & LIVE UI TARGETS (ALLOWED TO UPDATE):**
  - `package.json`, `next.config.js`
  - `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
  - `src/components/`
  - `src/shared-math/math-config.ts`, `src/shared-math/units.ts`

## BASE SECTION 7: LESSONS LEARNED (All Sites)

### Infrastructure
- **Tailwind v4** is installed (not v3). Use `@import "tailwindcss"` in CSS, `@tailwindcss/postcss` in `postcss.config.mjs`, and `@theme inline` for design tokens. Do NOT use `tailwind.config.ts` or `@tailwind base/components/utilities`.
- **Animation**: Use `tw-animate-css` (not `tailwindcss-animate`).
- **next-themes**: Import `ThemeProviderProps` from `"next-themes"` directly (not `"next-themes/dist/types"`).
- **tsconfig.json**: Exclude `_ui_goal` and `legacy-php-backup` to prevent build failures from reference-only files.
- **SSG + AWS Amplify**: `output: 'export'` means Next.js `redirects()` is dead code. Use `customHttp.yml` for Amplify-level redirects. Use wildcard rules per legacy directory (e.g., `/phpforce/<*>` → `/force/`), not individual PHP file entries.

### Recharts (Interactive Charts)
- Use `recharts` for interactive charts (line, bar, area, pie, etc.).
- **SSR guard**: Create a separate client component file that imports from `recharts` directly, then lazy-load that **entire component** via `next/dynamic` with `{ ssr: false }`. Do NOT dynamically import individual Recharts pieces — this breaks the parent-child relationship (e.g., `ResponsiveContainer` gets -1 dimensions).
- Wrap charts in `<ResponsiveContainer width="100%" height="100%">` inside a container with explicit height (e.g., `h-[300px]`).
- **Tooltip formatter typing**: Never type-annotate `formatter` params. Cast inside the function body instead:
  ```tsx
  // CORRECT — let TypeScript infer, cast inside
  formatter={(value) => [`${Number(value).toFixed(1)}`, "Label"]}
  ```

### Testable Math Functions
- **Every calculator MUST have a `calc.ts`** (or `calc-[name].ts`) with pure math functions. No exceptions.
  - `calc.ts` contains ONLY math: BigNumber operations, PI from math-config. No React, no form handling, no unit conversion.
  - `Calculator.tsx` MUST import and call functions from `calc.ts` — math must NOT be inline in `onSubmit`.
  - `Calculator.test.ts` MUST import from `calc.ts` — tests must NOT duplicate formulas inline.
  - Unit conversion stays in `Calculator.tsx` (convert to canonical units → call calc.ts → convert result back).
- Unit converters (`*-converter/`) are exempt — they only call `convertUnit()` directly with no custom math.

### Select Component (Base UI)
- The Select is **Base UI** (`@base-ui/react`), NOT Radix.
- **Every** `<SelectValue>` must use a render function to show human-readable labels — never display raw values.
- **`onValueChange` null guard**: Base UI Select passes `string | null` to `onValueChange`. Always guard with `(v) => v && setter(v)`.

### Shared Math Libraries
- **`src/shared-math/units.ts`** — Full unit conversion library. Key functions: `convertUnit()`, `getUnitOptions()`, `getUnitLabel()`, `getUnitKeys()`.
- **`src/shared-math/math-config.ts`** — Uses `bignumber.js` directly. `formatResult()` displays 8 significant digits. `PI` and `TWO_PI` exported as 64-digit BigNumber constants — always import from here, never redefine locally.

### Page Structure & Calculator Card Boundary
- `page.tsx` must be a **Server Component** (no `"use client"`) so `generateMetadata()` works.
- Calculator logic goes in a separate `Calculator.tsx` client component.
- `<AdSlot />` and `<ShareButtons />` are placed **outside** the shell in each `Calculator.tsx`.
- **Calculator Card Boundary:** The calculator shell (bordered card with shadow) is the visual boundary. Everything inside the card = the calculator. Everything outside = supporting content.
  - **Inside the card:** Shell header, formula display, form inputs, solution box, charts/tables
  - **Between card and content:** `<ShareButtons />`, `<AdSlot />`
  - **Outside the card:** Educational content as `<section>` elements. Light borders (`border border-slate-200 dark:border-slate-800`) OK. Heavy borders (`border-2`, `shadow-md`) only for Related Sites/Calculators section.
  - **Card border:** Plain `<div>` with `rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground overflow-hidden`. NOT shadcn Card.
  - **No double rounding:** Header must NOT have `rounded-t-xl` — parent's `overflow-hidden` clips corners.
  - **Main padding:** `px-2 py-3 sm:px-6 sm:py-6 lg:px-12 lg:py-6`

### Sharing
This site does not use URL parameters. Share buttons share the clean base URL. No `useSearchParams`, no `Suspense` wrapper, no `replaceState` needed.

### Scroll-to-Calculate Pattern
1. **`id="calculator"`** on the shell for scroll targeting.
2. **`jumpToCalculator` callback** that smooth-scrolls to `#calculator`.
3. **Button wiring**: Calculate button calls the compute function. `jumpToCalculator` is exclusively for educational CTA buttons.
4. **Educational CTA buttons**: `variant="outline"` with `border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950`, text: "Calculate [Variable] ↑"

### Case-Insensitive Filesystem (Docker on Mac)
- Docker on macOS uses a case-insensitive filesystem. `calculator.test.ts` and `Calculator.test.ts` are the same file.
- **Always create test files as `Calculator.test.ts`** (capital C).

### Stale `.next` Cache
- The `.next` build cache is the #1 cause of runtime errors during development.
- **Fix**: `rm -rf .next && npx next dev --port 3000`. The npm `dev` script already does this.
- After adding/removing pages or modifying `page.tsx` server components, always restart with clean cache.

### Build Memory (OOM)
- Production builds may run out of memory. The build script uses `NODE_OPTIONS='--max-old-space-size=4096'` to allocate 4GB heap (set in `package.json`).

### Mobile Layout / Overflow Prevention
- `globals.css` sets `overflow-x: hidden` on both `html` and `body`.
- All four shell components have `overflow-hidden` on their `<article>` wrapper.
- Two-column grids must use `grid-cols-1 sm:grid-cols-2` (not bare `grid-cols-2`).
- Wide data tables must be wrapped in `<div className="overflow-x-auto">`.
- Test at 375px viewport width.

### Legal Pages
- Legal pages exist at `/terms`, `/privacy`, `/accessibility`. They use `@tailwindcss/typography` (`prose`) classes. Footer links to all three.

## BASE SECTION 8: GUARDRAILS (All Sites)

### SEO Guardrails
- Never add client-side-only content that Google can't crawl
- Never remove or change the canonical URL without explicit user approval
- Never change the `<h1>` — title tag and h1 must stay aligned
- Warn if page weight exceeds 500 KB gzipped
- Never add interstitials, modals, or popups that block content on page load
- Never use hidden text, CSS tricks, or invisible elements to stuff keywords
- Never add `noindex` or `nofollow` without explicit user approval

### AdSense Guardrails
- Never place ads above the main content fold
- Never add more than 1 ad unit without explicit user approval
- Never auto-refresh ads or trigger ad loads programmatically
- Ad client/slot IDs are LOCKED

### User Experience Guardrails
- Calculator inputs must feel instant — no JavaScript hydration delays
- Results should be visible without scrolling after clicking Calculate
- Never add required signup, email capture gates, or paywalls
- Never add cookie consent banners unless legally required
- Never auto-play audio or video

### Content & Plagiarism Guardrails
- All educational content must be **original** — never copy from competitor sites
- When researching topics, **synthesize and rewrite** in our own voice
- FAQ answers must match between the visible page content and the `FAQPage` JSON-LD schema

## Site-Specific

### SECTION 1: DESIGN SYSTEM & UI
- **Palette:** `cyan-600` (Shell header / accents), `cyan-50` (Solution box / highlight cards), `zinc-50` (Backgrounds), `slate-700` (Secondary text).
- **Shell:** Uses `AutoChartCalculatorShell` — no Calculate button, results derive from `useForm` + `watch()` + `useMemo` and update instantly on every input change. Solution always visible (shows "—" when inputs are invalid).
- **Aesthetic:** "Engineering Laboratory" - high contrast, clean, no gradients.
- **Navigation:** Single-calculator site — no sidebar, no internal navigation. Footer has legal page links only.
- **Summary cards:** Interest Saved and Time Saved highlighted with cyan tinting (`border-cyan-200 bg-cyan-50`). Other summary cards use standard slate borders.
- **Amortization table:** Toggle between yearly snapshots and all-months view. Columns: Month, Payment, Interest, Principal, Extra (when applicable), Balance.
- **No formula display** — loan math is straightforward, no react-katex needed.

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
