# [SYSTEM_DIRECTIVE]: DO NOT SUMMARIZE, TRUNCATE, OR MODIFY THIS FILE.
# AJDesigner Migration: Core Logic & Style Blueprint
> **Constraint Level:** Absolute (Must apply to all legacy conversions)

## SECTION 1: DESIGN SYSTEM & UI
- **Palette:** `cyan-600` (Primary Actions / Calculate button), `zinc-50` (Backgrounds), `slate-700` (Secondary text).
- **Aesthetic:** "Engineering Laboratory" - high contrast, clean, no gradients.
- **Dark Mode:** Must fully support `next-themes` via Tailwind `dark:` classes.
- **Navigation:** The Sidebar MUST physically push main content when opened; it cannot overlay (to protect AdSense viewability). Mobile trigger uses a hamburger icon (`Menu` from lucide-react), not a chevron. The sidebar shows **category links only** (not individual calculators) — with 200+ calculators, listing them all would be unusable.
- **Header Bar:** Hidden on desktop (`md:hidden`). Only visible on mobile for the sidebar trigger. No duplicate "AJ Designer" text — the logo is in the sidebar only.

## SECTION 2: ARCHITECTURAL STANDARDS
- **Framework:** Next.js 15+ App Router.
- **Shell:** Every page must export a default function wrapped in one of four shells:
  - `CalculatorShell` — button-click calculate, no charts (most calculators)
  - `ChartCalculatorShell` — button-click calculate + charts/tables (e.g., loan, mortgage-loan, horsepower-elapsed-time, horsepower-trap-speed, tire-size, pay-raise, trailer-towing)
  - `AutoCalculatorShell` — auto-calculate on input change, no charts (e.g., tip calculator, temperature converter). Results derive from `useMemo`, no Calculate button. Solution always visible (shows "—" when empty).
  - `AutoChartCalculatorShell` — auto-calculate on input change + charts/tables (e.g., dog-age, cat-age, subwoofer). Same reactive pattern with chart/table props.
  Chart shells accept `chart` and `table` props (`ReactNode`) rendered below the solution inside the same card. For multiple charts or tables, wrap them in a fragment: `chart={<><Chart1 /><Chart2 /></>}`. Formula display is optional in chart shells. Auto shells use a `<div>` instead of `<form>` and include an `id="solution"` anchor for CTA scroll targeting.
  **`afterSolution` prop:** Available on `CalculatorShell` and `AutoCalculatorShell` only (NOT on chart shells). Use for conversion tables or supplementary result data.
  **Ads and Share buttons:** All shells have NO internal `<AdSlot />` or `<ShareButtons />`. These are placed outside the shell in each `Calculator.tsx`.
  **`ShareButtons` interface:** `title: string` (calculator name), `solution: string` (pass `solution ?? ""` so buttons are always visible).
- **Math Engine:** Strictly use `@/shared-math/math-config` (`bignumber.js` with 64-digit decimal precision).
- **Consolidation:** Combine related PHP files into ONE `page.tsx` using dropdown selectors:
  - **"Solve For" dropdown**: Always present — lets the user choose which variable to solve for (e.g., density/mass/volume).
  - **Equation type dropdown**: When a calculator covers multiple related equation families (e.g., kinetic vs. static friction), add a second selector above "Solve For" to switch between them. This changes the formulas, labels, and KaTeX display dynamically.
  - Example: Friction calculator has "Friction Type" (kinetic/static) + "Solve For" (force/coefficient/normal force) = 6 PHP pages → 1 page.
- **Validation:** Use `zod` + `react-hook-form`. All inputs must be numeric. Strictly prevent division-by-zero errors.
- **Testing:** Use `vitest`. Every calculator must have a `Calculator.test.ts` file that imports from `calc.ts` and tests its formulas with known inputs/outputs using approximate equality (`toBeCloseTo`). Shared math (`units.ts`, `math-config.ts`) must have unit tests including conversion round-trips. Run `npx vitest run` to verify before completing a migration.
- **Formula Verification:** Every calc.ts function must pass round-trip consistency tests — if `solveX(a, b) = c`, then `solveA(c, b)` must return `a`. Test with at least 2 input sets per function. For new calculators, verify at least one result against an external reference (Wolfram Alpha, textbook, NWS, NIST).

## SECTION 3: REVENUE & SEO (CRITICAL)
- **Ad Placement:** `<AdSlot />` is placed **outside** the shell component, not inside it. Each `Calculator.tsx` renders AdSlot directly after the shell and ShareButtons. Ads must be always visible on page load (not gated behind a Calculate click) for AdSense policy compliance.
- **Ad Code (LOCKED — NEVER modify):** The AdSlot component uses these exact values: `data-ad-client="ca-pub-6158058519275033"`, `data-ad-slot="5439322335"`, `style={{ display: "block" }}`, `data-ad-format="auto"`, `data-full-width-responsive="true"`. The AdSense global script in `layout.tsx` loads `adsbygoogle.js?client=ca-pub-6158058519275033`. The push call uses `(adsbygoogle = window.adsbygoogle || []).push({})` (no `window.` prefix on left side). Do NOT change any of these values.
- **Ad Protection:** Maintain a `min-h-[250px]` and a 50px vertical margin. UI elements MUST NOT overlap this zone. The index page has NO ads.
- **Redirects:** Add redirect rules to `customHttp.yml` for AWS Amplify (since Next.js `redirects()` is dead code with `output: 'export'`).
- **Metadata:** Export `generateMetadata()` (NOT `export const metadata`) with unique titles, descriptions, canonical URLs, and OpenGraph tags (including `og:image` pointing to `/images/og-default.jpg` — 1200x630). Inject **two** JSON-LD schemas via plain `<script>` tags with `type="application/ld+json"` and `dangerouslySetInnerHTML`:
  1. **`MathSolver`** — includes `inLanguage: "en"`, `publisher` (Organization with logo), `potentialAction` (SolveMathAction with EntryPoint and query-input)
  2. **`FAQPage`** — `mainEntity` array of `Question`/`Answer` pairs matching the FAQ section in Calculator.tsx
  Do NOT use `next/script` (`<Script>`) — it injects at runtime via JS, which means the JSON-LD is invisible to crawlers in SSG (`output: 'export'`). Also do NOT use `metadata.other` (renders as `<meta>` instead of `<script>`). JSON-LD publisher logo: `/images/aj_01.jpg`.
- **SEO Files:** `public/robots.txt` (allows all crawlers, points to sitemap) and `public/sitemap.xml` (auto-generated). The `prebuild` script (`scripts/generate-sitemap.mjs`) reads `calculator-catalog.ts` and writes `sitemap.xml` automatically — no manual edits needed. It runs before every `npm run build`.
- **Breadcrumbs:** Pass breadcrumbs to `CalculatorShell` via the `breadcrumbs` prop. They render inside the card above the title.

## SECTION 4: MATH, UNITS & A11Y
- **Math Display:** Translate legacy image equations to `react-katex`. Pre-render to eliminate layout flicker. Use `<BlockMath />` for primary formulas.
- **Result Precision:** `formatResult()` displays 8 significant digits and uses scientific (e) notation for values ≥1e12 or <1e-4. See Shared Math Libraries in Section 7 for details.
- **Legacy Images:** Replace formula images with `react-katex`. Replace simple diagrams/tables with HTML/CSS (better for a11y, SEO, and dark mode). Only keep images for complex visuals that can't be reasonably recreated — place those in `public/images/` with descriptive `alt` text.
- **Symbols:** Convert plain text carets (`^`) and underscores (`_`) to KaTeX/Unicode equivalents in UI labels.
- **Unit Dropdowns:** Format labels as "Name (Symbol)" (e.g., `meter^3` becomes `Meter (m³)`).
- **Unit Values:** The `value` attribute of dropdown options MUST be the unit key string from `units.ts` (e.g., `"kilogram"`, `"meter^3"`). Conversion factors are looked up internally — never use raw numeric multipliers as values.
- **Screen Readers (a11y):** Math formulas must have a `.sr-only` English description. Wrap results in an `<output>` tag with `aria-live="polite"`.
- **Sidebar a11y:** Sidebar renders as `<nav aria-label="Main navigation">`. Active page link uses `aria-current="page"` and a visual highlight (`bg-primary/10`). All menu buttons must have `focus-visible:ring-2` for keyboard navigation.

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
- **OUTPUT ZONE (NEW CALCULATORS):** Write ONLY to newly created folders inside `src/app/[FOLDER_NAME]/` and append mappings to `customHttp.yml`.

## SECTION 6: EXECUTION WORKFLOW
**When migrating a legacy calculator:**
1. READ target legacy folder in `legacy-php-backup/`. If the legacy calculator includes charts or interactive visualizations (e.g., ExtJS, Flash, or JS-generated charts), the migrated Next.js calculator must include equivalent interactive charts using `recharts` and `ChartCalculatorShell`.
2. ANALYZE variables, math formulas, and unit multipliers.
3. CONSOLIDATE into a single Next.js page that matches the UI patterns of the existing live calculators (e.g., `src/app/density/`). Use these as the reference template, not `_ui_goal/`.
4. VERIFY a11y, Zod logic, and color applications (`cyan-600` for Calculate button, `slate-600`/`slate-400` for educational headings).
5. ADD any new unit categories to `src/shared-math/units.ts` if the calculator requires units not yet ported (e.g., force, length, temperature).
6. WRITE tests in a `.test.ts` file next to the calculator. Test each "Solve For" variant with known inputs and approximate equality. Test any new unit conversions with round-trips.
7. RUN `npx vitest run` and fix any failures before considering the migration complete.
8. UPDATE `src/app/calculator-catalog.ts` — change the migrated calculator entry from `soon()` to `live()` with its route path.
9. ADD a wildcard redirect to `customHttp.yml` for the legacy directory (e.g., `source: /phpforce/<*>` → `target: /force/`). One rule per legacy directory — do NOT list individual PHP files.
10. UPDATE index page category data if the calculator adds to a new or existing category.
11. RUN `npm run build` — the `prebuild` script auto-generates `sitemap.xml` from the catalog.

**When updating or fixing live UI components:**
1. READ the existing live calculators (e.g., `src/app/density/`) as the reference template.
2. APPLY code fixes to `src/` files while preserving the established patterns.

## SECTION 7: LESSONS LEARNED

### Infrastructure
- **Tailwind v4** is installed (not v3). Use `@import "tailwindcss"` in CSS, `@tailwindcss/postcss` in `postcss.config.mjs`, and `@theme inline` for design tokens. Do NOT use `tailwind.config.ts` or `@tailwind base/components/utilities`.
- **Animation**: Use `tw-animate-css` (not `tailwindcss-animate`).
- **next-themes**: Import `ThemeProviderProps` from `"next-themes"` directly (not `"next-themes/dist/types"`).
- **tsconfig.json**: Exclude `_ui_goal` and `legacy-php-backup` to prevent build failures from reference-only files.
- **SSG + AWS Amplify**: `output: 'export'` means Next.js `redirects()` is dead code. Use `customHttp.yml` for Amplify-level redirects. Use wildcard rules per legacy directory (e.g., `/phpforce/<*>` → `/force/`), not individual PHP file entries.

### Recharts (Interactive Charts)
- Use `recharts` for interactive charts (line, bar, area, pie, etc.).
- **SSR guard**: Create a separate client component file that imports from `recharts` directly, then lazy-load that **entire component** via `next/dynamic` with `{ ssr: false }`. Do NOT dynamically import individual Recharts pieces — this breaks the parent-child relationship (e.g., `ResponsiveContainer` gets -1 dimensions).
  ```tsx
  // DogAgeChart.tsx — normal "use client" component importing from recharts directly
  // Calculator.tsx — lazy-load the whole chart
  const DogAgeChart = dynamic(() => import("./DogAgeChart"), { ssr: false });
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
  - Unit conversion stays in `Calculator.tsx` (convert to canonical units → call calc.ts → convert result back).
  - This ensures one source of truth: if a formula changes, the test validates the actual production code.
  ```
  src/app/dog-age/
    calc-dog-age.ts      ← pure math, exported functions
    Calculator.tsx       ← imports from calc-dog-age.ts, handles units + UI
    Calculator.test.ts   ← imports from calc-dog-age.ts, tests the real code
  ```
- Unit converters (`*-converter/`) are exempt — they only call `convertUnit()` directly with no custom math.

### Select Component (Base UI)
- The Select is **Base UI** (`@base-ui/react`), NOT Radix.
- `SelectValue` displays the raw `value` prop in the trigger — not the `SelectItem` children text.
- The `label` prop on `SelectItem` only affects keyboard navigation, not trigger display.
- **Fix**: **Every** `<SelectValue>` must use a render function to show human-readable labels — never display raw values (e.g., `boylesLaw` must show as "Boyle's Law"). This applies to unit dropdowns, solve-for selectors, and equation type selectors:
  ```tsx
  // Unit dropdowns — build lookup from getUnitOptions()
  const massLabels = Object.fromEntries(massOptions.map(o => [o.key, o.label]));
  <SelectValue>{(v: string) => massLabels[v] ?? v}</SelectValue>

  // Solve-for / equation type — inline label map
  <SelectValue>
    {(v: string) => {
      const labels: Record<string, string> = { force: "Force (F)", mass: "Mass (m)" };
      return labels[v] ?? v;
    }}
  </SelectValue>
  ```
- Pre-build lookup maps (e.g., `massLabels`, `volumeLabels`, `densityLabels`) from `getUnitOptions()` at module scope for efficient trigger display.
- **`onValueChange` null guard**: Base UI Select passes `string | null` to `onValueChange`. Always guard with `(v) => v && setter(v)` for unit dropdowns, or `(value: string | null) => { if (!value) return; ... }` for handlers with logic.

### Shared Math Libraries
- **`src/shared-math/units.ts`** — Full unit conversion library ported from `legacy-php-backup/php/units/units.php`. All calculators must use this instead of inline unit definitions.
  - Categories use friendly names: `"mass"`, `"volume"`, `"density"` (not the PHP `"mass/length^3"` style).
  - Key functions: `convertUnit()`, `getUnitOptions()`, `getUnitLabel()`, `getUnitKeys()`.
  - `convertUnit(value, fromUnit, toUnit, category)` mirrors PHP logic: `value × fromFactor ÷ toFactor`.
- **`src/shared-math/math-config.ts`** — Uses `bignumber.js` directly (mathjs was removed — it's incompatible with `bignumber.js` BigNumber and adds ~170kB to the bundle). `formatResult()` displays 8 significant digits and uses scientific (e) notation for values ≥1e12 or <1e-4. Do NOT use `math.format()` from mathjs.
  - **`PI` and `TWO_PI`** are exported as high-precision (64-digit) BigNumber constants. Always `import { PI } from "@/shared-math/math-config"` — never redefine `new BigNumber(Math.PI)` or `new BigNumber("3.14159...")` locally. `Math.PI` is acceptable only in plain JS number operations (not BigNumber chains).
- **Base units differ by category**: mass = pound, volume = meter³, density = kg/m³. When computing (e.g., density = mass ÷ volume), first convert inputs to canonical units (kilogram, meter³) via `convertUnit()` before arithmetic.

### Page Structure
- `page.tsx` must be a **Server Component** (no `"use client"`) so `generateMetadata()` works.
- Calculator logic goes in a separate `Calculator.tsx` client component.
- `<AdSlot />` and `<ShareButtons />` are placed **outside** the shell in each `Calculator.tsx` — the shells contain no ad or share logic.
- `CalculatorShell` accepts an `afterSolution` prop that renders content after the solution result (e.g., "Solution in Other Units" conversion table).
- **Breadcrumbs** are passed to `CalculatorShell` via the `breadcrumbs` prop — they render inside the card above the title. Do NOT render `<Breadcrumbs />` standalone outside the shell.
- Include legacy educational/SEO content (definitions, explanations) from the PHP source below the calculator, rendered outside `<CalculatorShell>` as a separate `<section>`. Use lighter heading styles (`text-base font-semibold text-slate-600 dark:text-slate-400`) so they don't compete with the calculator title.

### Internal Linking (Related Calculators Section)
Every calculator's educational content ends with a **Related Calculators** bordered card containing 4-6 links:
1. **Same category (2-3 links)** — calculators from the same catalog category (e.g., force → gravity, kinetic-energy, newtons-second-law)
2. **Cross-category (1-2 links)** — calculators that share variables or are commonly used together (e.g., force → impulse-momentum from Physics, ohms-law → power from Engineering)
3. **Unit converter (1 link)** — link to the relevant unit converter if the calculator uses units (e.g., force → `/force-converter`, density → `/density-converter`)

**How to choose cross-category links:**
- If the calculator uses mass → link to density or weight calculators
- If it uses velocity → link to kinetic energy or projectile motion
- If it uses pressure → link to fluid pressure or Bernoulli
- If it's a finance calculator → link to related finance tools (loan → mortgage-loan, rule-of-72 → compound interest)
- Always prefer links where the user would naturally want to calculate the next thing

**Link format:** `[Calculator Name](/slug) — one-sentence description of what it calculates.`

### Shareable URLs Pattern
Every calculator must support shareable URLs so users can copy/share pre-filled calculations:
1. **`Suspense` wrapper**: Export `Calculator` wrapping `CalculatorInner` in `<Suspense fallback={null}>`
2. **`useSearchParams`**: Read URL params on mount via a `useEffect` with a `paramsLoaded` guard
3. **Pre-fill form**: Set solveFor/equationType/unit states from URL params, then `setValue` form fields in a `setTimeout` (to allow schema re-render), then auto-submit via `handleSubmit(onSubmit)()`
4. **Update URL on calculate**: At the end of `onSubmit`, call `window.history.replaceState` with all input values, solveFor, and unit selections as URL params
5. **Reference implementation**: `/workspace/src/app/force/Calculator.tsx`

### Scroll-to-Calculate Pattern
Every calculator must implement the "scroll-to-calculate" UX pattern:
1. **`id="calculator"`** on the `<CalculatorShell>` for scroll targeting.
2. **`jumpToCalculator` callback** (via `useCallback`) that sets the calculator state (solve-for or equation type), resets the form, clears results, and smooth-scrolls to `#calculator`:
   ```tsx
   const jumpToCalculator = useCallback((sf: SolveFor) => {
     setSolveFor(sf);
     setSolution(null);
     setResultRows([]);
     reset();
     setTimeout(() => {
       document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
     }, 50);
   }, [reset]);
   ```
3. **Button wiring**: The main Calculate button (`bg-cyan-600`) must call the `calculate`/`compute` function (or have no `onClick` if results are reactive via `useMemo`). **Never** wire it to `jumpToCalculator` — that causes the page to scroll to the top on click. `jumpToCalculator` is exclusively for the educational CTA buttons below the calculator (outline style with "↑" arrow) that scroll users back up to the form.
4. **Educational content sections** use bordered cards for each **equation type** (e.g., kinetic vs. static friction, Ideal Gas Law vs. Boyle's Law) — NOT one card per rearranged variable. The solve-for dropdown handles variable rearrangement; the cards guide users to the right equation:
   - `rounded-lg border border-slate-200 dark:border-slate-800 p-5 space-y-3`
   - Heading: `text-base font-semibold text-slate-600 dark:text-slate-400`
   - "When to use" framing: explain the scenario (e.g., "Use this when you know **mass and volume**…")
   - Formula in text form (`font-medium text-foreground`)
   - CTA button styled as `variant="outline"` with `border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950`
   - Button text: "Calculate [Variable] ↑" (using `&uarr;` entity)
5. Non-card educational sections (intro, comparisons, references) use plain `<div>` blocks without borders.

### Multi-Equation Calculator Pattern
When a legacy calculator has multiple equation families (e.g., drag force + terminal velocity), use this pattern:
1. Define `EquationType` union and `SolveFor` union (prefixed per equation to avoid collisions, e.g., `"v0_hd"` for horizontal distance v₀)
2. `equationLabels: Record<EquationType, string>` for the equation type dropdown
3. `solveForOptions: Record<EquationType, { value: SolveFor; label: string }[]>` — solve-fors change when equation type changes
4. `defaultSolveFor: Record<EquationType, SolveFor>` — reset solve-for when equation type changes
5. `schemas: Record<SolveFor, z.ZodObject<...>>` — one zod schema per solve-for
6. `formulas: Record<SolveFor, string>` — LaTeX per solve-for
7. `srFormulas: Record<SolveFor, string>` — screen reader text per solve-for
8. On equation type change: reset solve-for to default, clear solution, reset form

Reference implementations: `stokes-law` (2 equation types), `engine` (7 equation types), `projectile-motion` (5 equation types).

### Bulk Modifications: Scripts vs Agents
For bulk file modifications across many calculators, prefer temporary scripts over agents when the transformation is pattern-identical (same change to every file). Use agents only when the transformation requires per-file judgment (reading existing code, adapting to different structures, choosing what to insert based on context).

**Script-appropriate (pattern-identical):**
- Renaming a prop, variable, or import across all files
- Adding the same import line to all Calculator.tsx files
- Deleting stale/duplicate files matching a pattern
- Bulk search-and-replace (sed, Python string replacement)

**Agent-appropriate (requires judgment):**
- Adding shareable URL logic (each calculator has different fields, units, state variables)
- Writing educational content (requires reading legacy PHP, domain knowledge)
- Extracting calc.ts (requires understanding each calculator's math)
- Running the checklist (requires reading and evaluating multiple aspects per file)

**Working directory:** Put all temporary scripts, logs, backups, and results in `/tmpscripts/` (gitignored). Example: `/tmpscripts/transform.py`, `/tmpscripts/before.tsx`, `/tmpscripts/transform.log`.

**Before running on all files:** Test the script on 2-3 representative files first (one simple calculator, one multi-equation, one chart calculator). Back up the first file before modifying (`cp file /tmpscripts/before.tsx`) and diff the result to verify the transform is correct. Only then run on all files.

**During execution:** Log which files are modified to `/tmpscripts/transform.log` so you know exactly what changed if the build fails.

**After running a script:** Always run `npx vitest run` and `npx next build` immediately. If the build fails, fix individual failures directly — do not re-run the script.

**Cleanup:** Delete the `/tmpscripts/` directory after use (`rm -rf /tmpscripts/`). The directory is gitignored as a safety net but should not be left around.

### Case-Insensitive Filesystem (Docker on Mac)
- Docker on macOS uses a case-insensitive filesystem. This means `calculator.test.ts` and `Calculator.test.ts` are the same file — you cannot rename one to the other via `mv` or `git mv`.
- **Always create new test files as `Calculator.test.ts`** (capital C) from the start. Never create with lowercase.

### Stale `.next` Cache
- The `.next` build cache is the #1 cause of runtime errors during development (webpack "Cannot read properties of undefined", ENOENT vendor-chunks, 500 errors on pages that should work).
- **Fix**: `rm -rf .next && npx next dev --port 3000`. The npm `dev` script already does `rm -rf .next` before starting.
- After adding/removing pages, changing layout, or modifying `page.tsx` server components, always restart the dev server with a clean cache.
- If you see a 500 error or webpack error that doesn't match your code, assume stale cache first.

### Build Memory (OOM)
- With 200+ pages, production builds may run out of memory. The build script uses `NODE_OPTIONS='--max-old-space-size=4096'` to allocate 4GB heap. This is set in `package.json` under the `build` script.
- If the build is killed with no error message, increase the heap size or free system memory.

### Mobile Layout / Overflow Prevention
- `globals.css` sets `overflow-x: hidden` on both `html` and `body` to prevent horizontal scroll on mobile. This is a global safety net — individual components should still avoid creating overflow.
- All four shell components (`CalculatorShell`, `ChartCalculatorShell`, `AutoCalculatorShell`, `AutoChartCalculatorShell`) have `overflow-hidden` on their `<article>` wrapper.
- Two-column grids must use `grid-cols-1 sm:grid-cols-2` (not bare `grid-cols-2`) so they stack on mobile.
- Wide data tables must be wrapped in `<div className="overflow-x-auto">` so they scroll horizontally instead of pushing the page wider.
- Test at 375px viewport width using Playwright MCP to catch overflow issues.

### Legal Pages
- **Legal pages** exist at `/terms`, `/privacy`, `/accessibility`. They use `@tailwindcss/typography` (`prose`) classes. Footer links to all three are in the layout.
# [END_DIRECTIVE]
