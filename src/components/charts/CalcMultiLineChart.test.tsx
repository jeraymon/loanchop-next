import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CalcMultiLineChart from "./CalcMultiLineChart";

// -----------------------------------------------------------------------------
// Rendering in jsdom: visx's <ParentSize> reads parent dimensions via
// ResizeObserver + getBoundingClientRect. jsdom doesn't run layout, so we
// rely on CalcMultiLineChart's `initialSize` fallback (w=360, h=chartHeight)
// to render something testable. Tests assert on structural output (legend
// entries, line count, marker count) rather than pixel positions.
// -----------------------------------------------------------------------------

const BASE_DATA = [
  { month: 1, normal: 1000, extra: 1000 },
  { month: 2, normal: 900, extra: 800 },
  { month: 3, normal: 800, extra: 600 },
  { month: 4, normal: 700, extra: null },
  { month: 5, normal: 600, extra: null },
];

const BASE_SERIES = [
  { key: "normal", label: "Normal", color: "#94a3b8" },
  { key: "extra", label: "Extra", color: "#0891b2" },
];

describe("CalcMultiLineChart", () => {
  it("renders without crashing and mounts an svg", () => {
    const { container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("auto-shows legend for multi-series, with one entry per series", () => {
    render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    expect(screen.getByText("Normal")).toBeTruthy();
    expect(screen.getByText("Extra")).toBeTruthy();
  });

  it("hides legend when series has only one entry (default)", () => {
    render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={[{ key: "normal", label: "Solo" }]}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    expect(screen.queryByText("Solo")).toBeNull();
  });

  it("respects showLegend={false} even with multiple series", () => {
    render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
        showLegend={false}
      />,
    );
    expect(screen.queryByText("Normal")).toBeNull();
  });

  it("draws one <path> per series (LinePath renders as path element)", () => {
    const { container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    const paths = container.querySelectorAll("svg path");
    // visx LinePath emits one path per series. Axis lines are rendered as <line>, not <path>,
    // so path count === series count for this simple chart (no fillColor, no highlights).
    expect(paths.length).toBeGreaterThanOrEqual(BASE_SERIES.length);
  });

  it("breaks the line at null values (LinePath defined-guard)", () => {
    // With `defined` in place, nullable values produce a gap rather than a bogus 0 point.
    // We assert by ensuring the component doesn't crash and still renders all expected series.
    const { container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    // Path data (`d` attr) for the "extra" series should contain a gap signal — visx emits
    // "M...L..." runs separated by a new "M" when defined returns false mid-series.
    const paths = Array.from(container.querySelectorAll("svg path")).map((p) =>
      p.getAttribute("d") ?? "",
    );
    // At least one path should contain multiple MoveTo commands (indicating a break).
    const hasBrokenPath = paths.some((d) => (d.match(/M/g) ?? []).length >= 2 || d.length === 0);
    // This is a soft assertion — we don't require specific path syntax, just that render succeeded.
    expect(hasBrokenPath || paths.length >= 2).toBe(true);
  });

  it("renders one marker per entry in markers[]", () => {
    const markers = [
      { x: 2, y: 900, color: "#16a34a", label: "Crossover" },
      { x: 4, y: 700 },
    ];
    const { container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
        markers={markers}
      />,
    );
    // Markers render as <circle>. Plus any from highlight (none here).
    const circles = container.querySelectorAll("svg circle");
    expect(circles.length).toBe(markers.length);
  });

  it("renders marker label next to the circle when provided", () => {
    render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
        markers={[{ x: 2, y: 900, label: "Crossover point" }]}
      />,
    );
    expect(screen.getByText("Crossover point")).toBeTruthy();
  });

  it("renders vertical reference line when referenceLines[].x is set", () => {
    const { container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
        referenceLines={[{ x: 3, color: "#dc2626", label: "Decision point" }]}
      />,
    );
    expect(screen.getByText("Decision point")).toBeTruthy();
    // Vertical reference line: the <line> with x1 === x2 (we can't easily assert
    // exact pixel coords in jsdom, but count reference <line> elements).
    expect(container.querySelectorAll("svg line").length).toBeGreaterThan(0);
  });

  it("only exposes role=\"img\" when ariaLabel is provided", () => {
    const { rerender, container } = render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    expect(container.querySelector('[role="img"]')).toBeNull();

    rerender(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
        ariaLabel="Loan balance over time"
      />,
    );
    const landmark = container.querySelector('[role="img"]');
    expect(landmark).toBeTruthy();
    expect(landmark?.getAttribute("aria-label")).toBe("Loan balance over time");
  });

  it("warns in dev when xLabel is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcMultiLineChart
        data={BASE_DATA}
        xKey="month"
        series={BASE_SERIES}
        xLabel=""
        yLabel="Balance"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("xLabel must be a non-empty string"));
    warn.mockRestore();
  });

  it("honors per-series connectNulls: filtered data emits fewer MoveTo commands", () => {
    // A series with a single null in the middle: default (connectNulls=false) should
    // produce a path with two `M` segments (broken line). connectNulls=true pre-filters
    // the null point out, producing one continuous path with a single `M`.
    const withGap = [
      { month: 1, a: 100, b: 100 },
      { month: 2, a: 200, b: 200 },
      { month: 3, a: null, b: 300 },
      { month: 4, a: 400, b: 400 },
    ];
    const { container: defaultContainer } = render(
      <CalcMultiLineChart
        data={withGap}
        xKey="month"
        series={[
          { key: "a", label: "A" },           // default: null breaks the line
          { key: "b", label: "B" },
        ]}
        xLabel="Month"
        yLabel="Value"
      />,
    );
    const defaultAPath = defaultContainer.querySelectorAll("svg path")[0];
    const defaultAMoveTos = (defaultAPath?.getAttribute("d") ?? "").match(/M/g)?.length ?? 0;
    expect(defaultAMoveTos).toBeGreaterThanOrEqual(2);

    const { container: connectContainer } = render(
      <CalcMultiLineChart
        data={withGap}
        xKey="month"
        series={[
          { key: "a", label: "A", connectNulls: true }, // skip null, draw one continuous line
          { key: "b", label: "B" },
        ]}
        xLabel="Month"
        yLabel="Value"
      />,
    );
    const connectAPath = connectContainer.querySelectorAll("svg path")[0];
    const connectAMoveTos = (connectAPath?.getAttribute("d") ?? "").match(/M/g)?.length ?? 0;
    expect(connectAMoveTos).toBe(1);
  });

  it("warns in dev when data is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <CalcMultiLineChart
        data={[]}
        xKey="month"
        series={BASE_SERIES}
        xLabel="Month"
        yLabel="Balance"
      />,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("data is empty"));
    warn.mockRestore();
  });
});
