import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormRegister, UseFormGetValues, UseFormSetError, UseFormClearErrors, FieldErrors, UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

const DEBOUNCE_MS = 1000;

type FormData = Record<string, string>;
type SchemaMap = Record<string, z.ZodTypeAny>;

const getSchemaFields = (schema: z.ZodTypeAny): string[] => {
  if (schema instanceof z.ZodObject) return Object.keys(schema.shape);
  if (schema instanceof z.ZodEffects) {
    const inner = schema.innerType();
    if (inner instanceof z.ZodObject) return Object.keys(inner.shape);
  }
  return [];
};

interface UseAutoCalculateOptions<S extends SchemaMap> {
  /** Map of solve-for key → zod schema (only input fields, not the solved variable) */
  schemas: S;
  /** Current solve-for key */
  solveFor: keyof S & string;
  /** react-hook-form's getValues */
  getValues: UseFormGetValues<FormData>;
  /** react-hook-form's register */
  register: UseFormRegister<FormData>;
  /** react-hook-form's setError */
  setError: UseFormSetError<FormData>;
  /** react-hook-form's clearErrors */
  clearErrors: UseFormClearErrors<FormData>;
  /** react-hook-form's errors object */
  errors: FieldErrors<FormData>;
  /** Calculator-specific compute function. Called with current form data and solve-for key.
   *  Should call setSolution/setResultRows/etc. internally. */
  compute: (data: FormData, solveFor: keyof S & string) => void;
}

interface UseAutoCalculateReturn {
  /** Whether the displayed solution is stale (user is typing) */
  isStale: boolean;
  /** Wraps register(id) to include onInputChange in onChange */
  reg: (id: string) => UseFormRegisterReturn;
  /** Attach to input onBlur — cancels debounce timer and computes immediately */
  handleBlurOrEnter: () => void;
  /** Call from handlers (equation/pill/unit switch) to compute immediately with no dimming */
  computeImmediate: (data: FormData, solveFor: string) => void;
  /** Validates fields and sets/clears error icons. Returns true if valid. */
  validate: (data: FormData, solveFor: string) => boolean;
}

/**
 * Shared auto-calculate hook for all calculators.
 *
 * Handles:
 * - 1s debounce on user typing (via input onChange)
 * - Instant validation (error icons appear immediately)
 * - isStale dimming while debounce is pending
 * - Immediate compute on blur/Enter
 * - computeImmediate for equation/pill/unit switch handlers
 *
 * Does NOT handle:
 * - solution/resultRows state (calculator-specific)
 * - Form setup (useForm, defaultValues)
 * - Equation/pill/unit change handlers (calculator calls computeImmediate)
 */
export function useAutoCalculate<S extends SchemaMap>({
  schemas,
  solveFor,
  getValues,
  register,
  setError,
  clearErrors,
  compute,
}: UseAutoCalculateOptions<S>): UseAutoCalculateReturn {
  const [isStale, setIsStale] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so callbacks always read the latest without recreating
  const solveForRef = useRef(solveFor);
  const computeRef = useRef(compute);

  useIsoLayoutEffect(() => {
    solveForRef.current = solveFor;
    computeRef.current = compute;
  }, [solveFor, compute]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // ---------------------------------------------------------------------------
  // validate — sets/clears error icons using the given schema
  // ---------------------------------------------------------------------------

  const validate = useCallback((data: FormData, sf: string) => {
    const schema = schemas[sf];
    if (!schema) return false;
    const result = schema.safeParse(data);
    const requiredFields = getSchemaFields(schema);
    if (result.success) {
      clearErrors();
    } else {
      // Preserve the first zod issue message per field so authored
      // validator text ("Required", "Must be between 0 and 100", …) reaches
      // the user. Falls back to "Invalid" only when zod emits an empty
      // message, which the shared validators never do but defensive code
      // shouldn't blank out an error.
      const messageByField = new Map<string, string>();
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string | undefined;
        if (field && !messageByField.has(field)) {
          messageByField.set(field, issue.message || "Invalid");
        }
      }
      requiredFields.forEach((f) => {
        const message = messageByField.get(f);
        if (message) setError(f, { message });
        else clearErrors(f);
      });
    }
    return result.success;
  }, [schemas, setError, clearErrors]);

  // ---------------------------------------------------------------------------
  // onInputChange — called from input onChange only. Validates immediately,
  // debounces compute.
  // ---------------------------------------------------------------------------

  const onInputChange = useCallback(() => {
    const data = getValues();
    const sf = solveForRef.current;
    const valid = validate(data, sf);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!valid) {
      computeRef.current(data, sf); // let compute clear solution
      setIsStale(false);
      return;
    }

    setIsStale(true);
    timerRef.current = setTimeout(() => {
      computeRef.current(getValues(), solveForRef.current);
      setIsStale(false);
    }, DEBOUNCE_MS);
  }, [getValues, validate]);

  // ---------------------------------------------------------------------------
  // computeImmediate — for handlers that bypass debounce
  // ---------------------------------------------------------------------------

  const computeImmediate = useCallback((data: FormData, sf: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    clearErrors();
    validate(data, sf);
    computeRef.current(data, sf);
    setIsStale(false);
  }, [validate, clearErrors]);

  // ---------------------------------------------------------------------------
  // handleBlurOrEnter — cancel timer, compute now
  // ---------------------------------------------------------------------------

  const handleBlurOrEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const data = getValues();
    const sf = solveForRef.current;
    validate(data, sf);
    computeRef.current(data, sf);
    setIsStale(false);
  }, [getValues, validate]);

  // ---------------------------------------------------------------------------
  // reg — wraps register's onChange with onInputChange
  // ---------------------------------------------------------------------------

  const reg = useCallback((id: string) => {
    const { onChange, ...rest } = register(id);
    const wrappedOnChange: typeof onChange = (e) => {
      const result = onChange(e);
      onInputChange();
      return result;
    };

    return {
      ...rest,
      onChange: wrappedOnChange,
    };
  }, [register, onInputChange]);

  // ---------------------------------------------------------------------------
  // Compute on initial mount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    computeImmediate(getValues(), solveFor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isStale, reg, handleBlurOrEnter, computeImmediate, validate };
}
