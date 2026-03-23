# [SYSTEM_DIRECTIVE]: DO NOT SUMMARIZE, TRUNCATE, OR MODIFY THIS FILE.
# LoanChop (loanchop.com): Architecture & Coding Patterns
> **Status:** Template — awaiting conversion.
> **Constraint Level:** Absolute (Must apply to all changes)

## SECTION 1: DESIGN SYSTEM & UI
- **Palette:** `cyan-600` (Primary Actions / Calculate button), `zinc-50` (Backgrounds), `slate-700` (Secondary text).
- **Aesthetic:** "Engineering Laboratory" - high contrast, clean, no gradients.
- **Dark Mode:** Must fully support `next-themes` via Tailwind `dark:` classes.
- **Navigation:** Single-calculator site — no sidebar, no internal navigation. Footer has legal page links only.
- **Shell header:** `bg-cyan-600 dark:bg-cyan-700` with white text, responsive padding (`px-4 sm:px-6`), responsive title (`text-xl sm:text-2xl font-bold text-white`).
- **Card:** `border-slate-300 dark:border-slate-700 shadow-md` — stronger than default for visual weight.
- **Solution box:** `bg-cyan-50 dark:bg-cyan-950/30` with `border-cyan-200 dark:border-cyan-800`. Cyan "SOLUTION" label (`text-cyan-600`) with large result text. Always visible.
- **Formula display:** Supports `latexFormulaMobile` prop for abbreviated formulas on small screens. Desktop shows full formula, mobile (`<sm`) shows abbreviated version. Both render via `react-katex` `BlockMath`.

## SECTION 2: ARCHITECTURAL STANDARDS
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
- **Validation:** Use `zod` + `react-hook-form`. All inputs must be numeric. Strictly prevent division-by-zero errors.
- **Testing:** Use `vitest`. Every calculator must have a `Calculator.test.ts` file that imports from `calc.ts` and tests its formulas with known inputs/outputs using approximate equality (`toBeCloseTo`). Run `npx vitest run` to verify before completing.
- **Formula Verification:** Every calc.ts function must pass round-trip consistency tests — if `solveX(a, b) = c`, then `solveA(c, b)` must return `a`. Test with at least 2 input sets per function.

## SECTION 3: REVENUE & SEO (CRITICAL)
- **Ad Placement:** `<AdSlot />` is placed **outside** the shell component, not inside it. Each `Calculator.tsx` renders AdSlot directly after the shell and ShareButtons. Ads must be always visible on page load (not gated behind a Calculate click) for AdSense policy compliance.
- **Ad Code (LOCKED — NEVER modify):** The AdSlot component uses these exact values: `data-ad-client="ca-pub-6158058519275033"`, `data-ad-slot="5439322335"`, `style={{ display: "block" }}`, `data-ad-format="auto"`, `data-full-width-responsive="true"`. The AdSlot component is self-contained: it includes both the AdSense `<script>` tag and the `<ins>` tag inside the `<aside>`. There is NO AdSense script in `layout.tsx`. The push call uses `(adsbygoogle = window.adsbygoogle || []).push({})` (no `window.` prefix on left side). Do NOT change any of these values.
- **Ad Protection:** Maintain a `min-h-[250px]` and a 50px vertical margin. UI elements MUST NOT overlap this zone. The index page has NO ads.
- **Redirects:** Add redirect rules to `customHttp.yml` for AWS Amplify (since Next.js `redirects()` is dead code with `output: 'export'`).
- **Metadata:** Export `generateMetadata()` (NOT `export const metadata`) with unique titles, descriptions, canonical URLs, and OpenGraph tags (including `og:image` pointing to `/images/og-default.jpg` — 1200x630). Inject **two** JSON-LD schemas via plain `<script>` tags with `type="application/ld+json"` and `dangerouslySetInnerHTML`:
  1. **`MathSolver`** — includes `inLanguage: "en"`, `publisher` (Organization with logo), `potentialAction` (SolveMathAction with EntryPoint and query-input)
  2. **`FAQPage`** — `mainEntity` array of `Question`/`Answer` pairs matching the FAQ section in Calculator.tsx
  Do NOT use `next/script` (`<Script>`) — it injects at runtime via JS, which means the JSON-LD is invisible to crawlers in SSG (`output: 'export'`). Also do NOT use `metadata.other` (renders as `<meta>` instead of `<script>`).
- **SEO Files:** `public/robots.txt` (allows all crawlers, points to sitemap) and `public/sitemap.xml` (auto-generated).
- **Breadcrumbs:** Removed. Single-calculator site has no page hierarchy.

## SECTION 4: MATH, UNITS & A11Y
- **Math Display:** Translate legacy image equations to `react-katex`. Pre-render to eliminate layout flicker. Use `<BlockMath />` for primary formulas.
- **Result Precision:** `formatResult()` displays 8 significant digits and uses scientific (e) notation for values >=1e12 or <1e-4. See Shared Math Libraries in Section 7 for details.
- **Legacy Images:** Replace formula images with `react-katex`. Replace simple diagrams/tables with HTML/CSS (better for a11y, SEO, and dark mode). Only keep images for complex visuals that can't be reasonably recreated — place those in `public/images/` with descriptive `alt` text.
- **Symbols:** Convert plain text carets (`^`) and underscores (`_`) to KaTeX/Unicode equivalents in UI labels.
- **Unit Dropdowns:** Format labels as "Name (Symbol)" (e.g., `meter^3` becomes `Meter (m³)`).
- **Unit Values:** The `value` attribute of dropdown options MUST be the unit key string from `units.ts` (e.g., `"kilogram"`, `"meter^3"`). Conversion factors are looked up internally — never use raw numeric multipliers as values.
- **Screen Readers (a11y):** Math formulas must have a `.sr-only` English description. Wrap results in an `<output>` tag with `aria-live="polite"`.
- **Navigation a11y:** Footer legal links use semantic `<nav>` with `aria-label`.

## SECTION 5: WORKSPACE BOUNDARIES (CRITICAL PROTECTIONS)
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
  *(Rule: You may update UI files to fix deprecations, but their design, structure, and AdSlot placement MUST match the patterns established in the existing live calculators.)*
- **OUTPUT ZONE:** Single-calculator site — calculator files live directly in `src/app/`.

## SECTION 6: EXECUTION WORKFLOW
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

## SECTION 7: LESSONS LEARNED

### Infrastructure
- **Tailwind v4** is installed (not v3). Use `@import "tailwindcss"` in CSS, `@tailwindcss/postcss` in `postcss.config.mjs`, and `@theme inline` for design tokens. Do NOT use `tailwind.config.ts` or `@tailwind base/components/utilities`.
- **Animation**: Use `tw-animate-css` (not `tailwindcss-animate`).
- **next-themes**: Import `ThemeProviderProps` from `"next-themes"` directly (not `"next-themes/dist/types"`).
- **tsconfig.json**: Exclude `_ui_goal` and `legacy-php-backup` to prevent build failures from reference-only files.
- **SSG + AWS Amplify**: `output: 'export'` means Next.js `redirects()` is dead code. Use `customHttp.yml` for Amplify-level redirects.

### Recharts (Interactive Charts)
- Use `recharts` for interactive charts (line, bar, area, pie, etc.).
- **SSR guard**: Create a separate client component file that imports from `recharts` directly, then lazy-load that **entire component** via `next/dynamic` with `{ ssr: false }`. Do NOT dynamically import individual Recharts pieces — this breaks the parent-child relationship (e.g., `ResponsiveContainer` gets -1 dimensions).
  ```tsx
  // Chart.tsx — normal "use client" component importing from recharts directly
  // Calculator.tsx — lazy-load the whole chart
  const Chart = dynamic(() => import("./Chart"), { ssr: false });
  ```
- Wrap charts in `<ResponsiveContainer width="100%" height="100%">` inside a container with explicit height (e.g., `h-[300px]`).
- **Tooltip formatter typing**: Never type-annotate `formatter` params (e.g., `value: number`). Recharts' `Formatter` type is complex and explicit annotations cause build errors. Cast inside the function body instead:
  ```tsx
  // WRONG — causes type error on build
  formatter={(value: number) => [`${value.toFixed(1)}`, "Label"]}
  // CORRECT — let TypeScript infer, cast inside
  formatter={(value) => [`${Number(value).toFixed(1)}`, "Label"]}
  ```

### Testable Math Functions
- **Every calculator MUST have a `calc.ts`** (or `calc-[name].ts`) with pure math functions. No exceptions.
  - `calc.ts` contains ONLY math: BigNumber operations, PI from math-config. No React, no form handling, no unit conversion.
  - `Calculator.tsx` MUST import and call functions from `calc.ts` — math must NOT be inline in `onSubmit`.
  - `Calculator.test.ts` MUST import from `calc.ts` — tests must NOT duplicate formulas inline.
  - Unit conversion stays in `Calculator.tsx` (convert to canonical units -> call calc.ts -> convert result back).
  - This ensures one source of truth: if a formula changes, the test validates the actual production code.

### Select Component (Base UI)
- The Select is **Base UI** (`@base-ui/react`), NOT Radix.
- `SelectValue` displays the raw `value` prop in the trigger — not the `SelectItem` children text.
- The `label` prop on `SelectItem` only affects keyboard navigation, not trigger display.
- **Fix**: **Every** `<SelectValue>` must use a render function to show human-readable labels — never display raw values.
- **`onValueChange` null guard**: Base UI Select passes `string | null` to `onValueChange`. Always guard with `(v) => v && setter(v)` for unit dropdowns.

### Shared Math Libraries
- **`src/shared-math/units.ts`** — Full unit conversion library. All calculators must use this instead of inline unit definitions.
  - Key functions: `convertUnit()`, `getUnitOptions()`, `getUnitLabel()`, `getUnitKeys()`.
  - `convertUnit(value, fromUnit, toUnit, category)` mirrors PHP logic: `value x fromFactor / toFactor`.
- **`src/shared-math/math-config.ts`** — Uses `bignumber.js` directly. `formatResult()` displays 8 significant digits and uses scientific (e) notation for values >=1e12 or <1e-4.
  - **`PI` and `TWO_PI`** are exported as high-precision (64-digit) BigNumber constants. Always `import { PI } from "@/shared-math/math-config"` — never redefine locally.

### Page Structure & Calculator Card Boundary
- `page.tsx` must be a **Server Component** (no `"use client"`) so `generateMetadata()` works.
- Calculator logic goes in a separate `Calculator.tsx` client component.
- `<AdSlot />` and `<ShareButtons />` are placed **outside** the shell in each `Calculator.tsx` — the shells contain no ad or share logic.
- **Breadcrumbs:** Removed from all shells. Single-calculator site has no page hierarchy.
- **Calculator Card Boundary:** The calculator shell (bordered card with shadow) is the visual boundary that tells users "this is the interactive tool." Everything inside the card (header, formula, inputs, solution, charts, tables) is the calculator. Everything outside the card is supporting content.
  - **Inside the card:** Shell header, formula display, form inputs, solution box, charts/tables
  - **Between card and content:** `<ShareButtons />`, `<AdSlot />`
  - **Outside the card:** Educational content rendered as a plain `<section>` — NOT inside the shell, NOT wrapped in bordered cards (except Related Sites at the bottom). Use lighter heading styles (`text-base font-semibold text-slate-600 dark:text-slate-400`) so they don't compete with the calculator title.
  - **Card border implementation:** Do NOT use the shadcn `Card` component for the calculator border — its default `ring-1 ring-foreground/10` is nearly invisible (~10% opacity), and `cn()` / tailwind-merge cannot reliably override `ring` classes. Instead, use a plain `<div>` with `rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-md bg-card text-card-foreground overflow-hidden`.
  - **No double rounding:** The accent-color header (e.g., `bg-cyan-600`) must NOT have `rounded-t-xl` — the parent div's `rounded-xl overflow-hidden` clips the corners automatically. Adding rounding to the header creates a visible gap ("double top" bug).
  - **Results inside the card:** Detailed results (Z-score, percentile breakdown, etc.) belong inside the card via the shell's `table` prop — not as a standalone section after the shell.
  - **Mobile outer padding:** The `<main>` element uses `px-2 py-3 sm:px-6 sm:py-6 lg:p-12` — tight 8px horizontal padding on mobile (the card has its own border/padding, so extra outer margin wastes screen space), scaling up at breakpoints.

### Related Sites (Cross-Site Linking)
Every calculator's educational content ends with a **Related Sites** bordered card containing 4-6 external links to sister sites:
- [Dollars Per Hour](https://www.dollarsperhour.com) — Hourly wage and salary calculators
- [AJ Designer](https://www.ajdesigner.com) — Engineering and science calculators
- [Percent Off Calculator](https://www.percentoffcalculator.com) — Discount and percentage calculators
- [LoanChop](https://www.loanchop.com) — Loan and mortgage calculators
- [InfantChart](https://www.infantchart.com) — Baby growth percentile charts
- [Hourly Salaries](https://www.hourlysalaries.com) — Salary conversion tools

**Link format:** `[Site Name](https://url) — one-sentence description.`

### Shareable URLs Pattern
Every calculator must support shareable URLs so users can copy/share pre-filled calculations:
1. **`Suspense` wrapper**: Export `Calculator` wrapping `CalculatorInner` in `<Suspense fallback={null}>`
2. **`useSearchParams`**: Read URL params on mount via a `useEffect` with a `paramsLoaded` guard
3. **Pre-fill form**: Set solveFor/equationType/unit states from URL params, then `setValue` form fields in a `setTimeout` (to allow schema re-render), then auto-submit via `handleSubmit(onSubmit)()`
4. **Update URL on calculate**: At the end of `onSubmit`, call `window.history.replaceState` with all input values, solveFor, and unit selections as URL params

### Scroll-to-Calculate Pattern
Every calculator must implement the "scroll-to-calculate" UX pattern:
1. **`id="calculator"`** on the `<CalculatorShell>` for scroll targeting.
2. **`jumpToCalculator` callback** (via `useCallback`) that sets the calculator state (solve-for or equation type), resets the form, clears results, and smooth-scrolls to `#calculator`.
3. **Button wiring**: The main Calculate button (`bg-cyan-600`) must call the `calculate`/`compute` function. **Never** wire it to `jumpToCalculator`. `jumpToCalculator` is exclusively for the educational CTA buttons below the calculator.
4. **Educational content sections** use bordered cards:
   - `rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-3`
   - Heading: `text-base font-semibold text-slate-600 dark:text-slate-400`
   - CTA button styled as `variant="outline"` with `border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950`
5. Non-card educational sections (intro, comparisons, references) use plain `<div>` blocks without borders.

### Case-Insensitive Filesystem (Docker on Mac)
- Docker on macOS uses a case-insensitive filesystem. This means `calculator.test.ts` and `Calculator.test.ts` are the same file — you cannot rename one to the other via `mv` or `git mv`.
- **Always create new test files as `Calculator.test.ts`** (capital C) from the start. Never create with lowercase.

### Stale `.next` Cache
- The `.next` build cache is the #1 cause of runtime errors during development (webpack "Cannot read properties of undefined", ENOENT vendor-chunks, 500 errors on pages that should work).
- **Fix**: `rm -rf .next && npx next dev --port 3000`. The npm `dev` script already does `rm -rf .next` before starting.
- After adding/removing pages, changing layout, or modifying `page.tsx` server components, always restart the dev server with a clean cache.
- If you see a 500 error or webpack error that doesn't match your code, assume stale cache first.

### Mobile Layout / Overflow Prevention
- `globals.css` sets `overflow-x: hidden` on both `html` and `body` to prevent horizontal scroll on mobile. This is a global safety net — individual components should still avoid creating overflow.
- All four shell components have `overflow-hidden` on their `<article>` wrapper.
- Two-column grids must use `grid-cols-1 sm:grid-cols-2` (not bare `grid-cols-2`) so they stack on mobile.
- Wide data tables must be wrapped in `<div className="overflow-x-auto">` so they scroll horizontally instead of pushing the page wider.
- Test at 375px viewport width using Playwright MCP to catch overflow issues.

### Legal Pages
- **Legal pages** exist at `/terms`, `/privacy`, `/accessibility`. They use `@tailwindcss/typography` (`prose`) classes. Footer links to all three are in the layout.

## SECTION 9: GUARDRAILS

### SEO Guardrails
- Never add client-side-only content that Google can't crawl (SSG handles this, but don't undermine it with client-only rendering of important text)
- Never remove or change the canonical URL without explicit user approval
- Never change the `<h1>` — the title tag (from `generateMetadata()`) and h1 (shell title) must stay aligned. Mismatches hurt click-through rate.
- Warn if page weight exceeds 500 KB gzipped (hurts Core Web Vitals and ranking)
- Warn if adding dependencies that significantly increase initial bundle size
- Never add interstitials, modals, or popups that block content on page load (Google penalizes this)
- Never use hidden text, CSS tricks, or invisible elements to stuff keywords
- Never add `noindex` or `nofollow` without explicit user approval

### AdSense Guardrails
- Never place ads above the main content fold (policy violation risk)
- Never add more than 1 ad unit without explicit user approval (ad density affects both revenue and UX)
- Never auto-refresh ads or trigger ad loads programmatically
- Warn if layout changes could cause Cumulative Layout Shift affecting ad viewability
- Ad client/slot IDs are LOCKED — see CLAUDE.md "NEVER Modify" section

### User Experience Guardrails
- Calculator inputs must feel instant — no JavaScript hydration delays blocking interaction
- Results should be visible without scrolling after clicking Calculate
- Never add required signup, email capture gates, or paywalls
- Never add cookie consent banners unless legally required for the user's target jurisdictions
- Warn if any change increases Largest Contentful Paint (LCP) above 2.5 seconds
- Never auto-play audio or video
- Never redirect users away from the calculator without their explicit action

### Content & Plagiarism Guardrails
- All educational content must be **original** — never copy text from competitor calculator sites (calculator.net, omnicalculator.com, smartasset.com, etc.)
- When researching topics, **synthesize and rewrite** in our own voice — don't lift paragraphs from government sites, Wikipedia, or other sources
- If referencing specific laws or statistics, cite the source but write the explanation originally
- Never use AI-generated content without reviewing it for accidental reproduction of training data
- FAQ answers must match between the visible page content and the `FAQPage` JSON-LD schema (Google can penalize mismatches)
- Google's Helpful Content system specifically detects and demotes sites with scraped or substantially similar content to existing pages — focus on unique value through our specific calculator features and worked examples
# [END_DIRECTIVE]
