import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import type { z } from "zod";

import { useAutoCalculate } from "@/hooks/useAutoCalculate";

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

  const runNow = useCallback(
    (nextSolveFor?: TSolveFor) => {
      computeImmediate(getValues(), nextSolveFor ?? solveFor);
    },
    [computeImmediate, getValues, solveFor],
  );

  const applyAndRecompute = useCallback(
    (apply: () => void, nextSolveFor?: TSolveFor) => {
      flushSync(apply);
      computeImmediate(getValues(), nextSolveFor ?? solveFor);
    },
    [computeImmediate, getValues, solveFor],
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
      validate,
    },
  };
}
