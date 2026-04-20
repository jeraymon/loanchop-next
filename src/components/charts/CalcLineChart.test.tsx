import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CalcLineChart from "./CalcLineChart";

// -----------------------------------------------------------------------------
// jsdom: @visx/responsive's ParentSize uses ResizeObserver (stubbed in
// test-setup.ts) and falls back to CalcLineChart's `initialSize` for sizing,
// so tests assert structural output, not pixel positions.
// -----------------------------------------------------------------------------

const LINE_DATA = [
  { x: 0, y: 0 },
  { x: 10, y: 686.7 },
  { x: 20, y: 1373.4 },
  { x: 30, y: 2060.1 },
];

describe("CalcLineChart", () => {
  it("renders without crashing and mounts an svg with at least one path", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="Mass (kg)"
        yLabel="Weight (N)"
        tooltipFormat={(p) => `Mass=${p.x}, Weight=${p.y}`}
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelectorAll("svg path").length).toBeGreaterThan(0);
  });

  it("renders the highlight dot as an svg <circle> when provided", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        highlight={{ x: 15, y: 1000 }}
        xLabel="Mass (kg)"
        yLabel="Weight (N)"
        tooltipFormat={(p) => `Mass=${p.x}`}
      />,
    );
    expect(container.querySelectorAll("svg circle").length).toBe(1);
  });

  it("renders no highlight dot when `highlight` is omitted", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="Mass (kg)"
        yLabel="Weight (N)"
        tooltipFormat={(p) => `Mass=${p.x}`}
      />,
    );
    expect(container.querySelectorAll("svg circle").length).toBe(0);
  });

  it("renders an AreaClosed region when fillColor is set", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
        fillColor="#0e7490"
      />,
    );
    // LinePath is one <path>; AreaClosed adds another. With fillColor we expect ≥2.
    expect(container.querySelectorAll("svg path").length).toBeGreaterThanOrEqual(2);
  });

  it("renders a vertical reference line with label when referenceLines[].x is set", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
        referenceLines={[{ x: 20, color: "#dc2626", label: "Critical" }]}
      />,
    );
    expect(screen.getByText("Critical")).toBeTruthy();
    expect(container.querySelectorAll("svg line").length).toBeGreaterThan(0);
  });

  it("renders a horizontal reference line when referenceLines[].y is set", () => {
    const { container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
        referenceLines={[{ y: 1000, label: "Threshold" }]}
      />,
    );
    expect(screen.getByText("Threshold")).toBeTruthy();
    expect(container.querySelectorAll("svg line").length).toBeGreaterThan(0);
  });

  it("only exposes role=\"img\" when ariaLabel is provided", () => {
    const { rerender, container } = render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
      />,
    );
    expect(container.querySelector('[role="img"]')).toBeNull();

    rerender(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
        ariaLabel="Weight scaling with mass"
      />,
    );
    const landmark = container.querySelector('[role="img"]');
    expect(landmark).toBeTruthy();
    expect(landmark?.getAttribute("aria-label")).toBe("Weight scaling with mass");
  });

  it("warns in dev when xLabel is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcLineChart
        lineData={LINE_DATA}
        xLabel=""
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("xLabel must be a non-empty string"));
    warn.mockRestore();
  });

  it("warns in dev when lineData has fewer than 2 points", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcLineChart
        lineData={[{ x: 0, y: 0 }]}
        xLabel="X"
        yLabel="Y"
        tooltipFormat={(p) => `${p.x}`}
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("need at least 2 to render"));
    warn.mockRestore();
  });
});
