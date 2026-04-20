## Controller Scaffold

This repo includes the shared controller helpers used for formula-style calculators:

- `useFormCalculatorController`
- `useObjectState`
- `useStableEvent`

These helpers standardize the hook layer around:

- form state
- validation
- debounced recompute
- solve-for transitions
- example loading
- grouped UI-facing returns

## Recommended Shape

```ts
return {
  state,
  actions,
  derived,
  ui,
};
```

Typical responsibilities:

- `state`: solve-for key, selected units, local view state
- `actions`: safe event handlers like `handleSolveForChange`, `loadExample`, unit changes
- `derived`: computed solution, chart/table data, show-your-work lines
- `ui`: `errors`, `isStale`, `reg`, `handleBlurOrEnter`

## Minimal Sketch

```ts
const schemas = {
  result: z.object({ a: positiveNum, b: positiveNum }),
} as const;

type SolveFor = keyof typeof schemas;

const DEFAULT_FORM_VALUES = {
  a: "1",
  b: "2",
  result: "3",
};

export function useExampleCalculator() {
  const units = useObjectState({
    lengthUnit: "meter",
  });

  const derived = useObjectState({
    solutionLabel: null as string | null,
    solutionValue: null as string | null,
  });

  const compute = useStableEvent((data: Record<string, string>, sf: SolveFor) => {
    if (sf !== "result") return;
    const value = Number(data.a) + Number(data.b);
    if (!Number.isFinite(value)) {
      derived.merge({ solutionLabel: null, solutionValue: null });
      return;
    }
    derived.merge({
      solutionLabel: "Result =",
      solutionValue: String(value),
    });
  });

  const controller = useFormCalculatorController<SolveFor>({
    defaultValues: DEFAULT_FORM_VALUES,
    schemas,
    initialSolveFor: "result",
    compute,
  });

  const solveFor = controller.state.solveFor;
  const { changeSolveFor, loadValues } = controller.actions;
  const { errors, isStale } = controller.derived;
  const { reg, handleBlurOrEnter } = controller.form;

  const loadExample = (values: Record<string, string>, sf?: SolveFor) => {
    loadValues({ values, solveFor: sf ?? solveFor });
  };

  return {
    state: { solveFor, units: units.state },
    actions: {
      handleSolveForChange: changeSolveFor,
      loadExample,
    },
    derived: derived.state,
    ui: {
      errors,
      isStale,
      reg,
      handleBlurOrEnter,
    },
  };
}
```

## Guardrails

- Wrap `compute` with `useStableEvent`.
- Hoist defaults and schemas to module scope.
- Do not put whole wrapper objects like `controller.actions` or the full `useObjectState(...)` return into dependency arrays.
- Use `.ts` for non-JSX hook files.
