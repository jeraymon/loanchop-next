import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CalcBarChart from "./CalcBarChart";

// -----------------------------------------------------------------------------
// jsdom: ParentSize uses ResizeObserver (stubbed in test-setup.ts) and falls
// back to CalcBarChart's `initialSize`. Tests assert structural output.
// -----------------------------------------------------------------------------

const DATA = [
  { period: "Weekly", before: 800, after: 900 },
  { period: "Monthly", before: 3200, after: 3600 },
  { period: "Yearly", before: 38400, after: 43200 },
];

const SERIES = [
  { key: "before" as const, label: "Before Raise", color: "#94a3b8" },
  { key: "after" as const, label: "After Raise", color: "#0e7490" },
];

describe("CalcBarChart", () => {
  it("renders without crashing and mounts an svg", () => {
    const { container } = render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("draws one <rect> per (series × category), plus hover-capture rects per category", () => {
    const { container } = render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    // Grouped bars: 3 categories × 2 series = 6 bar rects, plus 3 hover-capture rects.
    // Lower bound: at least the bar count.
    const rects = container.querySelectorAll("svg rect");
    expect(rects.length).toBeGreaterThanOrEqual(DATA.length * SERIES.length);
  });

  it("auto-shows legend for multi-series, with one entry per series", () => {
    render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(screen.getByText("Before Raise")).toBeTruthy();
    expect(screen.getByText("After Raise")).toBeTruthy();
  });

  it("hides legend when series has only one entry (default)", () => {
    render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={[{ key: "before", label: "Solo" }]}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(screen.queryByText("Solo")).toBeNull();
  });

  it("renders reference lines with label", () => {
    render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
        referenceLines={[{ y: 40000, label: "Annual budget cap" }]}
      />,
    );
    expect(screen.getByText("Annual budget cap")).toBeTruthy();
  });

  it("only exposes role=\"img\" when ariaLabel is provided", () => {
    const { rerender, container } = render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(container.querySelector('[role="img"]')).toBeNull();

    rerender(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
        ariaLabel="Pay before and after raise"
      />,
    );
    const landmark = container.querySelector('[role="img"]');
    expect(landmark).toBeTruthy();
    expect(landmark?.getAttribute("aria-label")).toBe("Pay before and after raise");
  });

  it("warns in dev when xLabel is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={SERIES}
        xLabel=""
        yLabel="Amount ($)"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("xLabel must be a non-empty string"));
    warn.mockRestore();
  });

  it("warns in dev when data is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcBarChart
        data={[]}
        categoryKey="period"
        series={SERIES}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("data is empty"));
    warn.mockRestore();
  });

  it("warns in dev when series is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcBarChart
        data={DATA}
        categoryKey="period"
        series={[]}
        xLabel="Period"
        yLabel="Amount ($)"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("series is empty"));
    warn.mockRestore();
  });
});
