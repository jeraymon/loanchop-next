"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath, Circle, AreaClosed } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import {
  useTooltip,
  TooltipWithBounds,
  defaultStyles as defaultTooltipStyles,
} from "@visx/tooltip";
import {
  CHART_MARGIN,
  DEFAULT_DOT_COLOR,
  DEFAULT_LINE_COLOR,
  formatTick,
  type ReferenceLineSpec,
} from "./chartHelpers";

/**
 * Shared line chart used by every calc that previously rendered a recharts
 * LineChart. Each calc's *Chart.tsx file should reduce to a thin wrapper
 * that passes calc-specific props into this component.
 *
 * Responsive: auto-sizes to parent container (reserve height via CSS on
 * the parent — default is 280px).
 * Accessible: axis labels render as SVG text; tick labels inherit color
 * via currentColor so they pick up theme text color in light/dark modes.
 * Pass `ariaLabel` to give screen-reader users a description.
 */

export type ChartPoint = { x: number; y: number };

export interface CalcLineChartProps {
  /** Series points. Must include at least 2 points to form a line. */
  lineData: ChartPoint[];
  /** X-axis label, shown centered below tick marks. Required and non-empty. */
  xLabel: string;
  /** Y-axis label, shown rotated -90° to the left of the y-axis. Required and non-empty. */
  yLabel: string;
  /** Render function for tooltip content; receives the nearest data point. */
  tooltipFormat: (point: ChartPoint) => ReactNode;
  /** Optional highlighted point drawn as a filled circle (the calc's solution). */
  highlight?: ChartPoint;
  /** Line stroke color (default slate-500). */
  lineColor?: string;
  /** Highlight-point fill color (default green-600). */
  dotColor?: string;
  /**
   * If set, fills the area under the line with this color at 20% opacity.
   * Turns the chart into a simple area chart. Leave undefined for an
   * unfilled line (default).
   */
  fillColor?: string;
  /** Reserved container height in px (default 280). */
  height?: number;
  /** Accessible name for the chart's SVG (optional but recommended — screen readers read this). */
  ariaLabel?: string;
  /**
   * Force the x-axis domain to include 0 (default: true). Good for engineering
   * charts that show "scaling from zero". Set false for tightly-clustered
   * positive-only data (ratios, narrow bands) where forcing zero visually
   * flattens the line.
   */
  includeZeroX?: boolean;
  /** Force the y-axis domain to include 0 (default: true). See includeZeroX. */
  includeZeroY?: boolean;
  /** Optional vertical or horizontal reference line overlays. */
  referenceLines?: ReferenceLineSpec[];
  /** Format x-axis tick values (default: formatTick from helpers). */
  xTickFormat?: (value: number) => string;
  /** Format y-axis tick values (default: formatTick from helpers). */
  yTickFormat?: (value: number) => string;
}

type InnerProps = Required<
  Pick<
    CalcLineChartProps,
    | "lineData"
    | "xLabel"
    | "yLabel"
    | "tooltipFormat"
    | "lineColor"
    | "dotColor"
    | "includeZeroX"
    | "includeZeroY"
    | "xTickFormat"
    | "yTickFormat"
  >
> & {
  highlight?: ChartPoint;
  fillColor?: string;
  referenceLines?: ReferenceLineSpec[];
  width: number;
  height: number;
};

function ChartInner({
  lineData,
  highlight,
  xLabel,
  yLabel,
  tooltipFormat,
  lineColor,
  dotColor,
  fillColor,
  includeZeroX,
  includeZeroY,
  xTickFormat,
  yTickFormat,
  referenceLines,
  width,
  height,
}: InnerProps) {
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<ChartPoint>();

  const { xScale, yScale, xTicks, yTicks, innerWidth, innerHeight } = useMemo(() => {
    const xs = lineData.map((p) => p.x).concat(highlight?.x ?? []);
    const ys = lineData.map((p) => p.y).concat(highlight?.y ?? []);
    const xMin = includeZeroX ? Math.min(...xs, 0) : Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = includeZeroY ? Math.min(...ys, 0) : Math.min(...ys);
    const yMax = Math.max(...ys);
    const innerW = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
    const innerH = Math.max(0, height - CHART_MARGIN.top - CHART_MARGIN.bottom);
    const xS = scaleLinear<number>({ domain: [xMin, xMax], range: [0, innerW] }).nice(5);
    const yS = scaleLinear<number>({ domain: [yMin, yMax], range: [innerH, 0] }).nice(5);
    return {
      xScale: xS,
      yScale: yS,
      xTicks: xS.ticks(5),
      yTicks: yS.ticks(5),
      innerWidth: innerW,
      innerHeight: innerH,
    };
  }, [lineData, highlight, width, height, includeZeroX, includeZeroY]);

  if (innerWidth < 10 || innerHeight < 10) return null;

  // Unified pointer handler — works for mouse, pen, and touch via Pointer Events.
  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const svgRect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const svgX = event.clientX - svgRect.left - CHART_MARGIN.left;
    if (svgX < 0 || svgX > innerWidth) {
      hideTooltip();
      return;
    }
    const xValue = xScale.invert(svgX);
    let nearest = lineData[0];
    let nearestDx = Math.abs(nearest.x - xValue);
    for (const p of lineData) {
      const dx = Math.abs(p.x - xValue);
      if (dx < nearestDx) {
        nearest = p;
        nearestDx = dx;
      }
    }
    showTooltip({
      tooltipData: nearest,
      tooltipLeft: CHART_MARGIN.left + xScale(nearest.x),
      tooltipTop: CHART_MARGIN.top + yScale(nearest.y),
    });
  };

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <g transform={`translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`}>
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
            tickValues={yTicks}
          />
          <GridColumns
            scale={xScale}
            height={innerHeight}
            stroke="currentColor"
            strokeDasharray="3 3"
            strokeOpacity={0.3}
            tickValues={xTicks}
          />
          {fillColor && (
            <AreaClosed
              data={lineData}
              x={(d) => xScale(d.x)}
              y={(d) => yScale(d.y)}
              yScale={yScale}
              fill={fillColor}
              fillOpacity={0.2}
              stroke="none"
            />
          )}
          <LinePath
            data={lineData}
            x={(d) => xScale(d.x)}
            y={(d) => yScale(d.y)}
            stroke={lineColor}
            strokeWidth={2}
          />
          {referenceLines?.map((ref, i) => {
            const color = ref.color ?? "#94a3b8";
            const dashArray = ref.dashed === false ? undefined : "4 4";
            if (ref.x !== undefined) {
              const rx = xScale(ref.x);
              return (
                <g key={`ref-${i}`}>
                  <line x1={rx} x2={rx} y1={0} y2={innerHeight} stroke={color} strokeDasharray={dashArray} strokeWidth={1.5} />
                  {ref.label && (
                    <text x={rx + 4} y={12} fontSize={11} fill={color}>
                      {ref.label}
                    </text>
                  )}
                </g>
              );
            }
            if (ref.y !== undefined) {
              const ry = yScale(ref.y);
              return (
                <g key={`ref-${i}`}>
                  <line x1={0} x2={innerWidth} y1={ry} y2={ry} stroke={color} strokeDasharray={dashArray} strokeWidth={1.5} />
                  {ref.label && (
                    <text x={innerWidth - 4} y={ry - 4} fontSize={11} fill={color} textAnchor="end">
                      {ref.label}
                    </text>
                  )}
                </g>
              );
            }
            return null;
          })}
          {highlight && (
            <Circle
              cx={xScale(highlight.x)}
              cy={yScale(highlight.y)}
              r={7}
              fill={dotColor}
              stroke="#fff"
              strokeWidth={1.5}
            />
          )}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            tickValues={xTicks}
            tickFormat={(v) => xTickFormat(v as number)}
            tickLabelProps={() => ({ fontSize: 11, textAnchor: "middle", dy: "0.33em", fill: "currentColor" })}
            label={xLabel}
            labelOffset={20}
            labelProps={{ fontSize: 12, textAnchor: "middle", fill: "currentColor" }}
            stroke="currentColor"
            tickStroke="currentColor"
          />
          <AxisLeft
            scale={yScale}
            tickValues={yTicks}
            tickFormat={(v) => yTickFormat(v as number)}
            tickLabelProps={() => ({ fontSize: 11, textAnchor: "end", dx: "-0.25em", dy: "0.33em", fill: "currentColor" })}
            label={yLabel}
            labelOffset={40}
            labelProps={{ fontSize: 12, textAnchor: "middle", fill: "currentColor" }}
            stroke="currentColor"
            tickStroke="currentColor"
          />
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            style={{ touchAction: "pan-y" }}
            onPointerMove={handlePointerMove}
            onPointerLeave={hideTooltip}
            onPointerCancel={hideTooltip}
          />
        </g>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultTooltipStyles, fontSize: 12 }}
        >
          {tooltipFormat(tooltipData)}
        </TooltipWithBounds>
      )}
    </div>
  );
}

export default function CalcLineChart({
  lineData,
  highlight,
  xLabel,
  yLabel,
  tooltipFormat,
  lineColor = DEFAULT_LINE_COLOR,
  dotColor = DEFAULT_DOT_COLOR,
  fillColor,
  height = 280,
  ariaLabel,
  includeZeroX = true,
  includeZeroY = true,
  referenceLines,
  xTickFormat = formatTick,
  yTickFormat = formatTick,
}: CalcLineChartProps) {
  // Dev-mode contract warnings — once per distinct prop shape, not every render.
  const warnedFor = useRef<string>("");
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const signature = `${xLabel.trim() === ""}|${yLabel.trim() === ""}|${lineData.length < 2}`;
    if (signature === warnedFor.current) return;
    warnedFor.current = signature;
    if (!xLabel.trim()) console.warn("CalcLineChart: xLabel must be a non-empty string — axis will render with no label");
    if (!yLabel.trim()) console.warn("CalcLineChart: yLabel must be a non-empty string — axis will render with no label");
    if (lineData.length < 2) console.warn(`CalcLineChart: lineData has ${lineData.length} point(s); need at least 2 to render a line`);
  }, [xLabel, yLabel, lineData.length]);

  // Only expose an img landmark when the chart has a real accessible name —
  // an unlabeled "img" role is worse than no role at all for SR users.
  const landmarkProps = ariaLabel ? { role: "img" as const, "aria-label": ariaLabel } : {};

  return (
    <div style={{ width: "100%", height }} {...landmarkProps}>
      <ParentSize initialSize={{ width: 360, height }} debounceTime={0}>
        {({ width: w, height: h }) => (
          <ChartInner
            lineData={lineData}
            highlight={highlight}
            xLabel={xLabel}
            yLabel={yLabel}
            tooltipFormat={tooltipFormat}
            lineColor={lineColor}
            dotColor={dotColor}
            fillColor={fillColor}
            includeZeroX={includeZeroX}
            includeZeroY={includeZeroY}
            xTickFormat={xTickFormat}
            yTickFormat={yTickFormat}
            referenceLines={referenceLines}
            width={w > 0 ? w : 360}
            height={h > 0 ? h : height}
          />
        )}
      </ParentSize>
    </div>
  );
}
