## Controller Pattern

This repo ships the controller-hook scaffold used by `ajdesigner-next`.

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

## Reference

See [src/lib/calculators/README.md](src/lib/calculators/README.md) for the local scaffold contract and a usage sketch.
