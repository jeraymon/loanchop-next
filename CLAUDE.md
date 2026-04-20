## Project Status

- The controller scaffold is available in this repo for future calculator migrations.
- New formula-based calculators should use `useFormCalculatorController` + `useObjectState`.
- `compute` should be wrapped in `useStableEvent` so controller actions always read the latest rendered state.

## Current Standard

- Hook return shape: `state`, `actions`, `derived`, `ui`
- Dependency-array guardrail: do not depend on whole wrapper objects like `controller.actions`; destructure stable members first
- Module-scope defaults: keep `DEFAULT_INPUTS`, `DEFAULT_FORM_VALUES`, and schemas outside the hook body
- Non-JSX hook files should use `.ts`
- Shared charts: prefer `src/components/charts/CalcLineChart`, `CalcBarChart`, and `CalcMultiLineChart` over bespoke recharts implementations when the chart fits those patterns

## Reference

Local controller docs live in [src/lib/calculators/README.md](src/lib/calculators/README.md).
