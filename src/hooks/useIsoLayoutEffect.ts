import { useEffect, useLayoutEffect } from "react";

/**
 * Isomorphic layout effect — `useLayoutEffect` in the browser, `useEffect`
 * on the server (to avoid the React SSR warning).
 *
 * Used by `useStableEvent` and `useAutoCalculate` to sync mutable refs
 * after commit. Layout-effect timing matters because unit/solve-for
 * handlers do `flushSync(setX)` and then immediately call
 * `computeImmediate(...)` on the next line — by that point layout effects
 * have run, but passive effects have not. Using a `useEffect`-based sync
 * would re-introduce the stale-closure class this codebase already
 * eliminated.
 */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
