import { useCallback, useRef } from "react";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect";

/**
 * Stable callback that always reads the latest rendered state.
 * Identity stable across renders; body reads ref.current reassigned every
 * render to the latest closure — state reads are never stale.
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
