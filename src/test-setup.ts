import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// @testing-library/react v14+ no longer auto-cleans-up between tests; we wire
// it up explicitly so rendered DOM doesn't leak across `it` blocks.
afterEach(() => {
  cleanup();
});

// jsdom doesn't ship ResizeObserver; @visx/responsive needs it.
// Minimal stub so ParentSize can mount without crashing — actual sizing
// falls back to initialSize in the component for deterministic tests.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
