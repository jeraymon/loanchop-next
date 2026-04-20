import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export function useObjectState<T extends object>(initialState: T): {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  setKey: <K extends keyof T>(
    key: K,
    value: T[K] extends string ? string : T[K],
  ) => void;
  merge: (patch: Partial<T>) => void;
} {
  const [state, setState] = useState(initialState);

  const setKey = useCallback(<K extends keyof T>(
    key: K,
    value: T[K] extends string ? string : T[K],
  ) => {
    setState((current) => {
      if (Object.is(current[key], value)) return current;
      return { ...current, [key]: value };
    });
  }, []);

  const merge = useCallback((patch: Partial<T>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  return { state, setState, setKey, merge };
}
