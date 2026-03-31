import { useCallback, useEffect, useRef, useState } from "react";
import type { UseFormRegister, UseFormGetValues, UseFormSetError, UseFormClearErrors, FieldErrors } from "react-hook-form";
import type { z } from "zod";

const DEBOUNCE_MS = 1000;

type FormData = Record<string, string>;
type SchemaMap = Record<string, z.ZodObject<Record<string, z.ZodTypeAny>>>;

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reg: (id: string) => Record<string, any>;
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
  solveForRef.current = solveFor;
  const computeRef = useRef(compute);
  computeRef.current = compute;

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
    const requiredFields = Object.keys(schema.shape);
    if (result.success) {
      clearErrors();
    } else {
      const bad = new Set(result.error.issues.map((i) => i.path[0] as string));
      requiredFields.forEach((f) => {
        if (bad.has(f)) setError(f, { message: "Invalid" });
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
    return {
      ...rest,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        onInputChange();
      },
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
