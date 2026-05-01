"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { LinePath, Circle } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import {
  useTooltip,
  TooltipWithBounds,
  defaultStyles as defaultTooltipStyles,
} from "@visx/tooltip";
import {
  CHART_MARGIN,
  DEFAULT_BAR_COLORS,
  formatTick,
  type ReferenceLineSpec,
} from "./chartHelpers";

/**
 * Shared multi-line chart for calcs that compare two or more series over a
 * shared x-axis. Examples in the wild (pre-migration):
 *   - compare2loans ComparisonCharts (two loan amortization lines)
 *   - loanchop BalanceChart (normal vs accelerated payoff)
 *   - temperaturetool TemperatureChart (4 temperature units)
 *   - optionsmath ProfitChart (long + short PnL)
 *
 * Not intended for:
 *   - Growth-percentile charts (percentile bands with a single reference dot — use bespoke visx)
 *   - Multi-region distribution charts (BellCurve overlays — use bespoke visx)
 */

export interface CalcMultiLineSeries {
  /** Numeric field in each data row for this series' y-value. Null/NaN values are skipped. */
  key: string;
  /** Legend and tooltip label. */
  label: string;
  /** Line stroke color. Defaults to the DEFAULT_BAR_COLORS cycle by index. */
  color?: string;
  /** Line stroke width in px. Default 2. Bump to emphasize one series. */
  strokeWidth?: number;
  /** Optional SVG dash pattern for this series (e.g. "5 5" for a dashed reference line). */
  dashArray?: string;
  /**
   * How to handle null/undefined/NaN values in this series:
   *   - `false` (default): break the line at null values (recharts' default — good for
   *     trailing-null cases like loan-paid-off, or when a null means "no value here").
   *   - `true`: skip null rows entirely and connect across them (matches recharts'
   *     `connectNulls` — good when nulls represent missing samples but the curve is
   *     semantically continuous, e.g. trigonometric `tan` asymptotes where you want
   *     adjacent defined points joined).
   */
  connectNulls?: boolean;
}

export interface MultiLineMarker {
  /** X-axis position (in data units). */
  x: number;
  /** Y-axis position (in data units). */
  y: number;
  color?: string;
  label?: string;
}

export interface CalcMultiLineChartProps {
  /** One row per x-axis value; each row has xKey + every series.key as a number (or null). */
  data: Array<Record<string, number | null | string>>;
  /** Field name for the x-axis position (e.g. "month", "input"). */
  xKey: string;
  /** Series definitions — one line per entry. */
  series: CalcMultiLineSeries[];
  /** X-axis label (required, non-empty). */
  xLabel: string;
  /** Y-axis label (required, non-empty). */
  yLabel: string;
  /**
   * Optional custom tooltip renderer. Defaults to a listing of every series'
   * value at the hovered x-position, color-coded with the legend swatch.
   */
  tooltipFormat?: (row: Record<string, number | null | string>, series: CalcMultiLineSeries[]) => ReactNode;
  /** X-tick format callback. Default formatTick. */
  xTickFormat?: (value: number) => string;
  /** Y-tick format callback. Default formatTick. */
  yTickFormat?: (value: number) => string;
  /**
   * Optional highlighted points overlaid on the lines. Usage varies — some calcs
   * put one marker per series (TemperatureChart), others put a single marker
   * for the computed answer (compare2loans crossover).
   */
  markers?: MultiLineMarker[];
  /** Show legend below the chart (default true). */
  showLegend?: boolean;
  /** Reserved container height in px (default 300; add 32 if legend shown). */
  height?: number;
  /** Accessible name for the chart. */
  ariaLabel?: string;
  /** Force include-0 on x-axis (default true). */
  includeZeroX?: boolean;
  /** Force include-0 on y-axis (default true). */
  includeZeroY?: boolean;
  /** Optional horizontal/vertical reference line overlays. */
  referenceLines?: ReferenceLineSpec[];
}

type InnerProps = Required<
  Pick<
    CalcMultiLineChartProps,
    "data" | "xKey" | "series" | "xLabel" | "yLabel" | "xTickFormat" | "yTickFormat" | "includeZeroX" | "includeZeroY"
  >
> & {
  tooltipFormat?: CalcMultiLineChartProps["tooltipFormat"];
  markers?: MultiLineMarker[];
  referenceLines?: ReferenceLineSpec[];
  width: number;
  height: number;
};

function expandDomain(min: number, max: number): [number, number] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min !== max) return [min, max];

  const delta = min === 0 ? 1 : Math.abs(min) * 0.01;
  const low = min - delta;
  const high = max + delta;
  return Number.isFinite(low) && Number.isFinite(high) && low !== high
    ? [low, high]
    : [0, 1];
}

function finiteX(row: Record<string, number | null | string>, xKey: string): number | null {
  const x = Number(row[xKey]);
  return Number.isFinite(x) ? x : null;
}

function finiteY(row: Record<string, number | null | string>, key: string): number | null {
  const y = row[key];
  return typeof y === "number" && Number.isFinite(y) ? y : null;
}

function MultiLineInner({
  data,
  xKey,
  series,
  xLabel,
  yLabel,
  tooltipFormat,
  xTickFormat,
  yTickFormat,
  markers,
  includeZeroX,
  includeZeroY,
  referenceLines,
  width,
  height,
}: InnerProps) {
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<Record<string, number | null | string>>();

  const { xScale, yScale, xTicks, yTicks, innerWidth, innerHeight, finiteRows, hasPlottableData } = useMemo(() => {
    const innerW = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
    const innerH = Math.max(0, height - CHART_MARGIN.top - CHART_MARGIN.bottom);

    const rowsWithFiniteX = data.filter((row) => finiteX(row, xKey) !== null);
    const xs: number[] = rowsWithFiniteX.map((row) => finiteX(row, xKey)!);
    const ys: number[] = [];
    for (const row of rowsWithFiniteX) {
      for (const s of series) {
        const v = finiteY(row, s.key);
        if (v !== null) ys.push(v);
      }
    }
    for (const m of markers ?? []) {
      if (Number.isFinite(m.x)) xs.push(m.x);
      if (Number.isFinite(m.y)) ys.push(m.y);
    }

    const xMin = xs.length === 0 ? 0 : includeZeroX ? Math.min(...xs, 0) : Math.min(...xs);
    const xMax = xs.length === 0 ? 1 : Math.max(...xs);
    const yMin = ys.length === 0 ? 0 : includeZeroY ? Math.min(...ys, 0) : Math.min(...ys);
    const yMax = ys.length === 0 ? 1 : Math.max(...ys);
    const xS = scaleLinear<number>({ domain: expandDomain(xMin, xMax), range: [0, innerW] }).nice(5);
    const yS = scaleLinear<number>({ domain: expandDomain(yMin, yMax), range: [innerH, 0] }).nice(5);

    return {
      xScale: xS,
      yScale: yS,
      xTicks: xS.ticks(5),
      yTicks: yS.ticks(5),
      innerWidth: innerW,
      innerHeight: innerH,
      finiteRows: rowsWithFiniteX,
      hasPlottableData: rowsWithFiniteX.length > 0 && ys.length > 0,
    };
  }, [data, xKey, series, markers, width, height, includeZeroX, includeZeroY]);

  if (innerWidth < 10 || innerHeight < 10 || !hasPlottableData) return null;

  // Pointer handler — snap to nearest row by x-distance.
  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>) => {
    const svgRect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const svgX = event.clientX - svgRect.left - CHART_MARGIN.left;
    if (svgX < 0 || svgX > innerWidth) {
      hideTooltip();
      return;
    }
    const xValue = xScale.invert(svgX);
    let nearest = finiteRows[0];
    let nearestDx = Math.abs(finiteX(nearest, xKey)! - xValue);
    for (const row of finiteRows) {
      const dx = Math.abs(finiteX(row, xKey)! - xValue);
      if (dx < nearestDx) {
        nearest = row;
        nearestDx = dx;
      }
    }
    showTooltip({
      tooltipData: nearest,
      tooltipLeft: CHART_MARGIN.left + xScale(finiteX(nearest, xKey)!),
      tooltipTop: event.clientY - svgRect.top,
    });
  };

  const defaultTooltipRenderer = (row: Record<string, number | null | string>, srs: CalcMultiLineSeries[]) => {
    const xVal = Number(row[xKey]);
    return (
      <>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>
          {xLabel}: {xTickFormat(xVal)}
        </div>
        {srs.map((s, i) => {
          const color = s.color ?? DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
          const v = row[s.key];
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 2, background: color, display: "inline-block" }} />
              <span>{s.label}: {yTickFormat(v)}</span>
            </div>
          );
        })}
      </>
    );
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
          {series.map((s, i) => {
            const color = s.color ?? DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
            const width = s.strokeWidth ?? 2;
            const dashArray = s.dashArray;
            const isDefined = (d: Record<string, number | null | string>) => {
              return finiteX(d, xKey) !== null && finiteY(d, s.key) !== null;
            };
            // connectNulls=true: pre-filter data to skip undefined rows entirely, so
            // the LinePath draws a continuous run across them. Default (false) relies
            // on visx's `defined` callback to break the path at missing points.
            const seriesData = s.connectNulls ? data.filter(isDefined) : data;
            return (
              <LinePath
                key={s.key}
                data={seriesData.filter((d) => finiteX(d, xKey) !== null)}
                x={(d) => xScale(finiteX(d, xKey)!)}
                y={(d) => {
                  const v = finiteY(d, s.key);
                  return v !== null ? yScale(v) : NaN;
                }}
                defined={isDefined}
                stroke={color}
                strokeWidth={width}
                strokeDasharray={dashArray}
              />
            );
          })}
          {referenceLines?.map((ref, i) => {
            const color = ref.color ?? "#94a3b8";
            const dashArray = ref.dashed === false ? undefined : "4 4";
            if (ref.x !== undefined && Number.isFinite(ref.x)) {
              const rx = xScale(ref.x);
              return (
                <g key={`ref-${i}`}>
                  <line x1={rx} x2={rx} y1={0} y2={innerHeight} stroke={color} strokeDasharray={dashArray} strokeWidth={1.5} />
                  {ref.label && <text x={rx + 4} y={12} fontSize={11} fill={color}>{ref.label}</text>}
                </g>
              );
            }
            if (ref.y !== undefined && Number.isFinite(ref.y)) {
              const ry = yScale(ref.y);
              return (
                <g key={`ref-${i}`}>
                  <line x1={0} x2={innerWidth} y1={ry} y2={ry} stroke={color} strokeDasharray={dashArray} strokeWidth={1.5} />
                  {ref.label && <text x={innerWidth - 4} y={ry - 4} fontSize={11} fill={color} textAnchor="end">{ref.label}</text>}
                </g>
              );
            }
            return null;
          })}
          {markers?.map((m, i) => {
            if (!Number.isFinite(m.x) || !Number.isFinite(m.y)) return null;
            const mx = xScale(m.x);
            const my = yScale(m.y);
            const color = m.color ?? "#16a34a";
            return (
              <g key={`marker-${i}`}>
                <Circle cx={mx} cy={my} r={6} fill={color} stroke="#fff" strokeWidth={1.5} />
                {m.label && (
                  <text x={mx + 10} y={my + 4} fontSize={11} fill={color} fontWeight={500}>
                    {m.label}
                  </text>
                )}
              </g>
            );
          })}
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
          {(tooltipFormat ?? defaultTooltipRenderer)(tooltipData, series)}
        </TooltipWithBounds>
      )}
    </div>
  );
}

function Legend({ series }: { series: CalcMultiLineSeries[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs pt-2">
      {series.map((s, i) => {
        const color = s.color ?? DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <span style={{ width: 14, height: 2, background: color, display: "inline-block" }} />
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CalcMultiLineChart({
  data,
  xKey,
  series,
  xLabel,
  yLabel,
  tooltipFormat,
  xTickFormat = formatTick,
  yTickFormat = formatTick,
  markers,
  showLegend,
  height = 300,
  ariaLabel,
  includeZeroX = true,
  includeZeroY = true,
  referenceLines,
}: CalcMultiLineChartProps) {
  const warnedFor = useRef<string>("");
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const signature = `${xLabel.trim() === ""}|${yLabel.trim() === ""}|${data.length === 0}|${series.length === 0}`;
    if (signature === warnedFor.current) return;
    warnedFor.current = signature;
    if (!xLabel.trim()) console.warn("CalcMultiLineChart: xLabel must be a non-empty string");
    if (!yLabel.trim()) console.warn("CalcMultiLineChart: yLabel must be a non-empty string");
    if (data.length === 0) console.warn("CalcMultiLineChart: data is empty — nothing to render");
    if (series.length === 0) console.warn("CalcMultiLineChart: series is empty — specify at least one line");
  }, [xLabel, yLabel, data.length, series.length]);

  const legendVisible = showLegend ?? series.length > 1;
  const chartHeight = height - (legendVisible ? 32 : 0);

  // Only expose an img landmark when the chart has a real accessible name —
  // an unlabeled "img" role is worse than no role at all for SR users.
  const landmarkProps = ariaLabel ? { role: "img" as const, "aria-label": ariaLabel } : {};

  return (
    <div style={{ width: "100%", height }} {...landmarkProps}>
      <div style={{ width: "100%", height: chartHeight }}>
        <ParentSize initialSize={{ width: 360, height: chartHeight }} debounceTime={0}>
          {({ width: w, height: h }) => (
            <MultiLineInner
              data={data}
              xKey={xKey}
              series={series}
              xLabel={xLabel}
              yLabel={yLabel}
              tooltipFormat={tooltipFormat}
              xTickFormat={xTickFormat}
              yTickFormat={yTickFormat}
              markers={markers}
              includeZeroX={includeZeroX}
              includeZeroY={includeZeroY}
              referenceLines={referenceLines}
              width={w > 0 ? w : 360}
              height={h > 0 ? h : chartHeight}
            />
          )}
        </ParentSize>
      </div>
      {legendVisible && <Legend series={series} />}
    </div>
  );
}
