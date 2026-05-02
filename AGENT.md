## Controller Pattern

This repo ships the controller-hook scaffold used by `ajdesigner-next`, and the existing `useLoanChopCalculator` (the only calc hook) is already migrated to it (`compute = useStableEvent(...)`, `applyAndRecompute` / `loadValues` for transitions, no `useRef` companions for UI state).

For new formula-based calculators, prefer:

- `src/lib/calculators/useFormCalculatorController.ts`
- `src/lib/calculators/useObjectState.ts`
- `src/hooks/useStableEvent.ts`
- existing `src/hooks/useAutoCalculate.ts`

Use the grouped hook return shape:

```ts
return {
  state,
  actions,
  derived,
  ui,
};
```

## Guardrails

- Wrap `compute` in `useStableEvent(...)`.
- Hoist `DEFAULT_INPUTS`, `DEFAULT_FORM_VALUES`, schema maps, and other static config to module scope.
- Do not put whole wrapper objects like `controller.actions`, `controller.state`, `controller.form`, or the full object returned by `useObjectState(...)` into `useCallback` / `useMemo` deps. Destructure stable members first.
- Expose action functions for transition-heavy state instead of raw setters.
- If a hook contains no JSX, use the `.ts` extension, not `.tsx`.

## When To Use It

- Use `useFormCalculatorController` for formula-style calculators with validation, examples, solve-for switching, or unit/state transitions.
- Keep truly tiny or lookup-style calculators bespoke if the controller would only add ceremony.
- If this repo already has a dedicated converter helper, keep using that for pure unit-converter flows.

## Shared Charts

- For compatible charts, use the shared visx family in `src/components/charts/`:
  - `CalcLineChart` for simple single-series line charts
  - `CalcBarChart` for categorical/grouped/stacked bar charts
  - `CalcMultiLineChart` for comparison charts with multiple series
- Keep bespoke charts bespoke only when they do not fit those shared primitives cleanly.
- Prefer thin route-local `*Chart.tsx` wrappers that adapt local data into the shared chart props.

## Lessons Learned

- **Quick Answer arithmetic must reproduce against `calc.ts`.** The original `$29,500` figure for "extra principal contributed" in `QUICK_ANSWER_EXAMPLE` was off by one month — the calculator stops applying extra payments once the regular payment can clear the remaining balance, so only 294 months × $100 actually flow through. Fixed in commits `e99b7f7` and `7fe5e22`. When updating the example copy, run the numbers through `compareWithAndWithoutExtra` rather than estimating.
- **Cap loan inputs** (`years`, `principal`) at the schema layer — `Number.isFinite` alone isn't enough. Commit `7bfb87b` added the caps after non-finite hardening exposed the amortization-schedule explosion path.
- **Hook closure pattern is non-negotiable.** When migrating `useLoanChopCalculator` to the controller (`f382a5b`), the rule is: mutable UI state stays in `useState` only (no `useRef` companions), `compute` is wrapped in `useStableEvent`, and handlers use `applyAndRecompute` instead of effect-based recomputes.
- **Redirects live in Amplify Console.** The version-controlled mirror is `amplify-redirects.json`, NOT `customHttp.yml` (which is headers-only). The `customHttp.yml` file in this repo has a comment block making this explicit — don't add `customRules:` blocks there.

## Reference

See [src/lib/calculators/README.md](src/lib/calculators/README.md) for the local scaffold contract and a usage sketch.
