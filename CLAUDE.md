# AJDesigner Calculator Migration

## Project Overview
Legacy PHP/Flash calculator site being migrated to Next.js 15+ (App Router, SSG, AWS Amplify).
See `AGENT.md` for full migration rules, patterns, and lessons learned.

## Key Commands
- `npx next dev --port 3000` — Start dev server
- `npx next build` — Production build (SSG export)
- `npx serve out -l 3000` — Serve the static SSG build locally (test what Amplify will serve)
- `npx vitest` — Run tests
- `npx vitest run` — Run tests once (CI mode)

## Migration Status
- **201 calculators + 21 unit converters live** (222 catalog pages + legal/index), all with educational content and FAQPage JSON-LD
- **204 test files, 1,427 tests** — all passing
- **All calculators** have shareable URLs (query params for pre-filled calculations)
- **All formulas cross-verified** — 1,175 round-trip consistency checks + Wolfram Alpha spot-checks
- **Production build** clean, no errors

## Project Structure
- `src/app/[calculator]/` — Each calculator gets a folder with `page.tsx` (server) + `Calculator.tsx` (client)
- `src/components/` — Shared UI components (CalculatorShell, ChartCalculatorShell, AutoCalculatorShell, AutoChartCalculatorShell, Breadcrumbs, AdSlot, ui/)
- `src/shared-math/` — `math-config.ts` (BigNumber, PI, TWO_PI), `units.ts` (unit conversion library)
- `src/app/calculator-catalog.ts` — Central catalog of all calculators
- `customHttp.yml` — Legacy URL redirects for Amplify (wildcard per legacy directory, e.g., `/phpforce/<*>` → `/force/`)
- `scripts/generate-sitemap.mjs` — Auto-generates `sitemap.xml` from catalog at prebuild
- `AGENT.md` — Detailed migration rules, UI patterns, lessons learned, and execution workflow
- `todo.txt` — Project-wide task tracker
- `template/` — Reusable starter kit for new calculator sites. `_reference/` has golden examples covering all shell types:
    - `density/` — **CalculatorShell** (multi-solve, unit conversions)
    - `force/` — **CalculatorShell** (ShareButtons + shareable URLs reference)
    - `loan/` — **ChartCalculatorShell** (button-click calculate + amortization charts)
    - `dog-age/` — **AutoChartCalculatorShell** (auto-calculate + Recharts chart)
    - `length-converter/` — **AutoCalculatorShell** (auto-calculate, no button, unit converter)
- `.claude/skills/calculator-checklist/` — Skill to validate calculator implementations
- `.mcp.json` — MCP server config (Playwright browser automation)
- `legacy-php-backup/` — READ-ONLY reference for original PHP calculators
- `_ui_goal/` — Legacy design reference (live calculators are now the primary reference)

## Tech Stack
- Next.js 15+, React, TypeScript, Tailwind CSS v4 (NOT v3)
- `bignumber.js` for precision math (NOT mathjs); `PI` and `TWO_PI` constants exported from `math-config.ts` — never redefine locally
- `react-katex` for formula rendering
- `zod` + `react-hook-form` for validation
- Base UI Select (`@base-ui/react`), NOT Radix
- `vitest` for testing
- `recharts` for interactive charts (lazy-load with `next/dynamic` + `{ ssr: false }`)
- `@tailwindcss/typography` for legal/prose pages

## Migration Checklist (per calculator)
See `AGENT.md` for detailed patterns, code examples, and styling specs.
- Use existing live calculators (e.g., `src/app/density/`) as the reference template
- If the legacy PHP calculator has charts/visualizations (ExtJS, Flash, JS), the Next.js version **must** include equivalent interactive charts using `recharts` + `ChartCalculatorShell`
- Follow the scroll-to-calculate pattern with bordered educational cards and CTA buttons (details in AGENT.md)
- Every `<SelectValue>` must use a render function for human-readable labels
- Choose the right shell for each calculator:
  - `CalculatorShell` — button-click calculate, no charts (most calculators)
  - `ChartCalculatorShell` — button-click calculate + charts/tables (loan, mortgage-loan, horsepower-elapsed-time, horsepower-trap-speed, tire-size, pay-raise, trailer-towing)
  - `AutoCalculatorShell` — auto-calculate on input change, no charts (use `useMemo` for results)
  - `AutoChartCalculatorShell` — auto-calculate on input change + charts/tables (dog-age, cat-age, subwoofer)
- Pass breadcrumbs via the shell's `breadcrumbs` prop
- Every calculator MUST have a `calc.ts` with pure math functions — `Calculator.tsx` imports from it, tests import from it (one source of truth). See AGENT.md for details
- Replace legacy formula images with `react-katex`; recreate simple diagrams in HTML/CSS
- Update `calculator-catalog.ts` (`soon()` → `live()`), `customHttp.yml`, and index page (sitemap auto-generates from catalog at build time)
- Write tests in a `.test.ts` file importing from `calc.ts` and run `npx vitest run`
- Educational content must follow this structure (details in AGENT.md):
  1. **How It Works** — 2-3 sentences in a bordered card with CTA button
  2. **Example Problem** — worked example with real numbers
  3. **FAQ** — 3-5 questions phrased as Google searches, 2-3 sentence answers
  4. **Related Calculators** — 4-6 links: 2-3 same category, 1-2 cross-category, 1 unit converter (see AGENT.md for linking rules)
- Add `FAQPage` JSON-LD schema to `page.tsx` alongside `MathSolver` — both as plain `<script>` tags

## Documentation Rules
- `CLAUDE.md` is the quick-reference. `AGENT.md` is the single source of truth for detailed patterns, code examples, and styling specs.
- When adding new rules or patterns, put the detail in `AGENT.md` and reference it from `CLAUDE.md` — never duplicate code examples or implementation details in both files.

## Troubleshooting
- **Runtime errors (500, webpack, ENOENT):** Almost always stale `.next` cache. Run `rm -rf .next && npx next dev --port 3000` (the `dev` script already does this). See AGENT.md for details.
- **Build OOM (killed with no error):** The build uses `NODE_OPTIONS='--max-old-space-size=4096'` (set in `package.json`). See AGENT.md for details.
- **Recharts Tooltip type errors:** Never type-annotate `formatter` params — use `Number(value)` inside the body. See AGENT.md for details.
- **JSON-LD not in static HTML:** Do NOT use `next/script` (`<Script>`) for JSON-LD — it injects via JS at runtime, invisible to crawlers in SSG. Use a plain `<script>` tag instead.

## Ignore Patterns
- Do NOT read or index `node_modules/`

## Read-Only Directories (read but NEVER modify)
- `legacy-php-backup/`, `_ui_goal/`

## NEVER Modify (locked values)
- **AdSense config** — `src/components/AdSlot.tsx` ad client/slot IDs (`ca-pub-6158058519275033`, `5439322335`) and `src/app/layout.tsx` AdSense script tag must NEVER be changed. These are the production ad codes.

## Update With Caution (ask user first)
- `.devcontainer/` — only for adding dependencies (e.g., Playwright)
- `.gemini/` — Gemini AI config (keep in sync with project patterns)

## Post-Task Documentation Updates
After completing any task, proactively suggest updates to documentation and config files if something new was learned. Always ask the user before making changes. Files to consider:
- `CLAUDE.md` / `AGENT.md` — project patterns and rules
- `.claude/skills/*/SKILL.md` — skill definitions
- `.gemini/` — Gemini-specific config
- `template/` — starter kit (keep in sync with latest components/configs)
- `todo.txt` — project task tracker
- `.devcontainer/` — container config
- `.mcp.json` — MCP server config
- `customHttp.yml` — redirect rules
- Any new config or doc file that would help future sessions
