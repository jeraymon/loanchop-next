import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAutoCalculate } from "./useAutoCalculate";

/**
 * Regression guard for the 2026-04-22 mount-effect bug.
 *
 * The mount-compute useEffect must fire computeImmediate exactly once on
 * mount. The pre-fix shape (deps: [computeImmediate, getValues, solveFor] +
 * setTimeout(0) + cleanup clearTimeout + hasInitializedRef) silently
 * dropped the first compute because each calc hook passes a new schemas
 * object identity every render, which cascaded through useCallback chains
 * and re-ran the effect before the 0ms timeout could fire.
 *
 * The inline schemas object in this test mirrors the real-world caller
 * pattern that triggered the bug — with deps-in-array, this test would fail
 * (compute would never be called). With the fixed `[]` deps, it passes.
 */
describe("useAutoCalculate mount-compute", () => {
  it("fires compute exactly once on mount with default form values", async () => {
    const compute = vi.fn();
    const schema = z.object({ x: z.string().min(1) });

    renderHook(() => {
      const form = useForm<Record<string, string>>({
        defaultValues: { x: "5" },
      });
      return useAutoCalculate({
        // Inline schemas object — new identity every render. This is the
        // caller pattern that exposed the bug. Keep it inline here on
        // purpose; don't hoist to module scope.
        schemas: { default: schema },
        solveFor: "default",
        getValues: form.getValues,
        register: form.register,
        setError: form.setError,
        clearErrors: form.clearErrors,
        errors: form.formState.errors,
        compute,
      });
    });

    await waitFor(() => {
      expect(compute).toHaveBeenCalled();
    });

    expect(compute).toHaveBeenCalledTimes(1);
    expect(compute).toHaveBeenCalledWith({ x: "5" }, "default");
  });
});
