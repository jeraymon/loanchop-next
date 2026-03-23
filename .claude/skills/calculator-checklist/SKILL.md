---
name: calculator-checklist
description: Verify a calculator implementation follows all AJDesigner patterns. Pass the calculator slug as an argument (e.g., /calculator-checklist density).
allowed-tools: Read, Grep, Glob
---

Verify the calculator at `src/app/$ARGUMENTS/` follows all AJDesigner patterns. Check each item and report pass/fail:

## Files
- [ ] `Calculator.tsx` exists (client component with `"use client"`)
- [ ] `page.tsx` exists (server component with metadata)
- [ ] Test file exists (`Calculator.test.ts` with capital C)
- [ ] No stale files (`_temp_test.ts`, `temp_test.ts`). Note: Docker-on-Mac uses a case-insensitive filesystem, so `calculator.test.ts` and `Calculator.test.ts` are the same file — do NOT flag this as a duplicate.
- [ ] If calculator has charts: separate chart component file exists (e.g., `DogAgeChart.tsx`)

## Shell
- [ ] Uses the correct shell (`CalculatorShell`, `ChartCalculatorShell`, `AutoCalculatorShell`, or `AutoChartCalculatorShell`)
- [ ] Auto-calculating calculators use `Auto*Shell` (not a dead Calculate button on a non-auto shell)
- [ ] Shell has `id="calculator"` prop
- [ ] Shell has `breadcrumbs` prop — breadcrumb category label MUST be an **exact string match** with the catalog label (e.g., "Finance & Real Estate" not "Finance", "Environmental & Water" not "Environmental")
- [ ] Formula display uses `react-katex` (`BlockMath`), not images

## Form & Validation
- [ ] Uses `useForm<Record<string, string>>()` generic type
- [ ] Uses `zod` schema for validation
- [ ] Every `<SelectValue>` uses a render function for human-readable labels
- [ ] Uses `BigNumber` from `bignumber.js` for math (not native JS floats)
- [ ] `PI` imported from `@/shared-math/math-config` (never defined locally, no `Math.PI`)

## SEO & Metadata
- [ ] `page.tsx` exports `generateMetadata()` function (NOT `export const metadata`)
- [ ] `MathSolver` JSON-LD schema present as plain `<script>` tag (NOT `next/script`)
- [ ] MathSolver JSON-LD includes `inLanguage`, `publisher` (with logo), and `potentialAction` fields
- [ ] `FAQPage` JSON-LD schema present as a second plain `<script>` tag
- [ ] FAQ questions match between JSON-LD and visible content in Calculator.tsx
- [ ] Metadata includes `openGraph` with `og:image` pointing to `/images/og-default.jpg`

## Educational Content (in Calculator.tsx)
- [ ] **How It Works** section — 2-3 sentences in a bordered card with CTA button
- [ ] **Example Problem** section — worked example with real numbers
- [ ] **FAQ** section — 3-5 questions with 2-3 sentence answers
- [ ] **Related Calculators** section — 4-6 links total:
  - 2-3 links from the same category
  - 1-2 cross-category links where formulas share variables (e.g., force → kinetic-energy, density → specific-gravity)
  - 1 link to a relevant unit converter if the calculator uses units (e.g., force → force-converter)
  - Each link uses format: `[Calculator Name](/slug) — one-sentence description`
- [ ] CTA button scrolls to calculator/solution (not page top)

## Charts (if applicable)
- [ ] Chart component lazy-loaded via `next/dynamic` with `{ ssr: false }`
- [ ] `ResponsiveContainer` wrapped in a div with explicit height (e.g., `h-[300px]`)
- [ ] Recharts Tooltip formatter params are NOT type-annotated

## Share & Ads
- [ ] `ShareButtons` component placed **outside** the shell (not passed as a shell prop)
- [ ] `AdSlot` placed **outside** the shell (shells have no internal AdSlot)
- [ ] `AdSlot` contains the complete AdSense ad code: both the `<script async src="...adsbygoogle.js?client=ca-pub-6158058519275033">` loader and the `<ins>` tag kept together in the same component — NEVER split them apart
- [ ] `AdSlot` values match exactly: `data-ad-client="ca-pub-6158058519275033"`, `data-ad-slot="5439322335"`, `style={{ display: "block" }}`, `data-ad-format="auto"`, `data-full-width-responsive="true"` — NEVER modify these
- [ ] No AdSense code in `layout.tsx` or the `<head>` — all AdSense code lives in `AdSlot.tsx`
- [ ] Share buttons are always visible (not conditional on solution existing)

## Shareable URLs
- [ ] `useSearchParams` imported from `next/navigation` to read URL params on load
- [ ] `window.history.replaceState` updates URL with input values after calculation
- [ ] Form pre-fills from URL params on mount (via `useEffect` + `setValue`)
- [ ] Wrapped in `<Suspense>` for SSG compatibility with `useSearchParams`
- [ ] Reference implementation: `/workspace/src/app/force/Calculator.tsx`

## Input Validation
- [ ] Division by zero cases handled gracefully (show error or prevent calculation, not silent NaN/Infinity)
- [ ] Negative square root cases handled (show error message, not NaN)
- [ ] Results display user-friendly error messages (not raw "NaN" or "Infinity")

## SEO — Canonical URLs
- [ ] `page.tsx` metadata includes `alternates: { canonical: "https://www.ajdesigner.com/[slug]" }`
- [ ] Canonical URL uses consistent format (trailing slash or no trailing slash — match the site convention)

## Catalog & Redirects
- [ ] Entry in `calculator-catalog.ts` is `live()` with correct route
- [ ] Calculator appears in **exactly one** catalog category (no duplicates)
- [ ] If a legacy PHP directory exists in `legacy-php-backup/` for this calculator, a wildcard redirect exists in `customHttp.yml`

## Math Extraction
- [ ] `calc.ts` (or `calc-*.ts` or `*-math.ts`) file exists with exported pure math functions (no React, no unit conversion)
- [ ] `Calculator.tsx` imports and calls functions from calc file (math NOT inline in onSubmit)
- [ ] Unit conversion remains in `Calculator.tsx`, not in calc file

## Tests
- [ ] Test file exists with name `Calculator.test.ts` (capital C, consistent naming)
- [ ] Test file imports from calc file — NOT duplicating formulas inline
- [ ] Tests cover each solve-for variant
- [ ] Tests use `toBeCloseTo` for floating point comparisons

## Formula Verification
- [ ] Round-trip consistency: if `solveX(a, b) = c`, then `solveA(c, b)` returns `a` (within floating-point tolerance)
- [ ] At least 2 different input sets tested per function
- [ ] For new calculators: verify at least one result against an external reference (Wolfram Alpha, textbook, NWS, NIST)

## Acceptable Exceptions (do NOT flag these as failures)
- **Auto-calculating calculators** (cat-age, dog-age, subwoofer) may use `useState` instead of `useForm`/zod — this is the correct pattern for `Auto*Shell` with reactive inputs
- **Tire-size calculator** uses `useState` with `ChartCalculatorShell` — acceptable as it has reactive inputs that compute on change
- **Integer-only calculators** (fractions, long-division, multiplication-grid, multiplication-lattice, addition) may use native JS numbers instead of BigNumber — integer arithmetic has no floating-point precision concerns
- **Unit converters** (`*-converter/`, `unit-converter/`, `temperature-conversion/`) are exempt from calc.ts, useForm/zod, and BigNumber requirements — they only call `convertUnit()` from the shared unit library
- **Complex DSP calculators** (subwoofer) may use native JS `Math.*` for audio signal processing where BigNumber conversion would be impractical
- **Horsepower chart calculators** (horsepower-elapsed-time, horsepower-trap-speed) use native JS `Math.pow` in calc.ts for fractional exponents — BigNumber `.pow()` only supports integer exponents
- **Days-between-dates** uses native JS float division for weeks/months/years conversion — acceptable for date arithmetic
- **Pay-raise calculator** uses native JS numbers for simple percentage/currency math — acceptable at this scale
- **Calculators with no legacy PHP equivalent** do not need a redirect in `customHttp.yml`

## Mobile Layout
- [ ] No horizontal overflow at 375px viewport width (test with Playwright if available)
- [ ] Two-column grids use `grid-cols-1 sm:grid-cols-2` (not `grid-cols-2` which overflows on mobile)
- [ ] Wide tables have `overflow-x-auto` wrapper

Report each item as PASS or FAIL with a brief note for failures. Do NOT flag acceptable exceptions as failures. Summarize the total at the end.
