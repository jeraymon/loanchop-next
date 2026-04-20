import { useCallback, useRef } from "react";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

/**
 * Stable callback that always reads the latest rendered state.
 *
 * Functionally equivalent to React's `useEffectEvent`, but without the
 * "must be called from an Effect or Effect Event" lint restriction — useful
 * when you need to pass the callback across hook boundaries (e.g. into
 * `useAutoCalculate`), provided the receiver only invokes it from event
 * handlers or Effects (both of which are safe call sites).
 *
 * Contract:
 * - Identity is stable across renders (useCallback with []), so downstream
 *   consumers using it as a useEffect / useCallback dep won't re-run.
 * - The body always reads `ref.current`, which is reassigned every render
 *   to the latest closure — so `useState` values read inside the callback
 *   body are never stale. This eliminates the ref-companion pattern that
 *   calculator hooks previously needed for unit selections.
 *
 * Usage:
 *   const compute = useStableEvent((data, sf) => {
 *     // reads latest `massUnit`, `volumeUnit`, etc. directly from closure
 *   });
 */
export function useStableEvent<A extends unknown[], R>(
  fn: (...args: A) => R,
): (...args: A) => R {
  const ref = useRef(fn);
  useIsoLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}
