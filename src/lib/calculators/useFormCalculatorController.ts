import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import type { z } from "zod";

import { useAutoCalculate } from "@/hooks/useAutoCalculate";
import { useIsoLayoutEffect } from "@/hooks/useIsoLayoutEffect";

type FormData = Record<string, string>;
type SchemaMap = Record<string, z.ZodTypeAny>;

type LoadValuesOptions<TSolveFor extends string> = {
  values?: Partial<Record<string, string | null | undefined>>;
  solveFor?: TSolveFor;
  apply?: () => void;
};

export function useFormCalculatorController<
  TSolveFor extends string,
  TFormValues extends object = any,
>({
  defaultValues,
  schemas,
  initialSolveFor,
  compute,
}: {
  defaultValues: TFormValues;
  schemas: SchemaMap;
  initialSolveFor: TSolveFor;
  compute: (data: TFormValues, solveFor: TSolveFor) => void;
}) {
  const [solveFor, setSolveFor] = useState<TSolveFor>(initialSolveFor);

  const {
    register,
    getValues,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: defaultValues as FormData });

  const { isStale, reg, handleBlurOrEnter, computeImmediate, validate } =
    useAutoCalculate({
      schemas,
      solveFor,
      getValues,
      register,
      setError,
      clearErrors,
      errors,
      compute: compute as (data: FormData, solveFor: string) => void,
    });

  // Refs so applyAndRecompute's body, running AFTER flushSync, reads the
  // freshest computeImmediate / solveFor. Without these, the body would still
  // hold the closure snapshot from before `apply()` ran — and `apply()` is
  // exactly where callers mutate state-derived schemas (e.g. ac-circuit's
  // equation toggle). useIsoLayoutEffect updates the refs synchronously
  // during React's commit phase, which flushSync drives before returning.
  const computeImmediateRef = useRef(computeImmediate);
  const solveForRef = useRef(solveFor);
  useIsoLayoutEffect(() => {
    computeImmediateRef.current = computeImmediate;
    solveForRef.current = solveFor;
  }, [computeImmediate, solveFor]);

  const runNow = useCallback(
    (nextSolveFor?: TSolveFor) => {
      computeImmediateRef.current(getValues(), nextSolveFor ?? solveForRef.current);
    },
    [getValues],
  );

  const applyAndRecompute = useCallback(
    (apply: () => void, nextSolveFor?: TSolveFor) => {
      flushSync(apply);
      computeImmediateRef.current(getValues(), nextSolveFor ?? solveForRef.current);
    },
    [getValues],
  );

  const changeSolveFor = useCallback(
    (value: string | null) => {
      if (!value) return;
      const nextSolveFor = value as TSolveFor;
      applyAndRecompute(() => setSolveFor(nextSolveFor), nextSolveFor);
    },
    [applyAndRecompute],
  );

  const loadValues = useCallback(
    ({ values, solveFor: nextSolveFor, apply }: LoadValuesOptions<TSolveFor>) => {
      const targetSolveFor = nextSolveFor ?? solveFor;
      applyAndRecompute(() => {
        apply?.();
        if (nextSolveFor) {
          setSolveFor(nextSolveFor);
        }
        Object.entries(values ?? {}).forEach(([key, value]) => {
          if (value == null) return;
          setValue(key, value, { shouldValidate: true });
        });
      }, targetSolveFor);
    },
    [applyAndRecompute, setValue, solveFor],
  );

  const setFieldValue = useCallback(
    (key: string, value: string, shouldValidate = true) => {
      setValue(key, value, { shouldValidate });
    },
    [setValue],
  );

  return {
    state: {
      solveFor,
    },
    actions: {
      setSolveForRaw: setSolveFor,
      changeSolveFor,
      runNow,
      applyAndRecompute,
      loadValues,
      setFieldValue,
    },
    derived: {
      isStale,
      errors: errors as FieldErrors<FormData>,
    },
    form: {
      reg,
      handleBlurOrEnter,
      getValues,
      watch,
      validate,
    },
  };
}
