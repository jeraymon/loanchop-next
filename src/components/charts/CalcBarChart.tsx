"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear } from "@visx/scale";
import { Bar } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import {
  useTooltip,
  TooltipWithBounds,
  defaultStyles as defaultTooltipStyles,
} from "@visx/tooltip";
import {
  CHART_MARGIN,
  DEFAULT_BAR_COLORS,
  formatTick,
  niceTicks,
  type ReferenceLineSpec,
} from "./chartHelpers";

/**
 * Shared bar chart used by calculators that compare categorical groups
 * (pay-raise periods, BOGO item totals, medical equation values).
 *
 * Supports grouped (side-by-side) or stacked bars. Categorical x-axis,
 * numeric y-axis. Tooltip appears on the hovered category column and
 * shows every series value for that category.
 */

export interface CalcBarSeries {
  /** Field in the data row that holds this series' numeric value. */
  key: string;
  /** Human label (used in legend + tooltip). */
  label: string;
  /** Optional custom color. Falls back to DEFAULT_BAR_COLORS cycle by index. */
  color?: string;
}

export interface CalcBarChartProps<
  TRow extends object = Record<string, string | number>,
  TCategoryKey extends keyof TRow & string = keyof TRow & string,
  TSeriesKey extends keyof TRow & string = keyof TRow & string,
> {
  /** One row per x-category. Each row has the categoryKey field plus series fields. */
  data: TRow[];
  /** Field name identifying the x-axis category (e.g. "period", "label"). */
  categoryKey: TCategoryKey;
  /** Series definitions — one bar per series per category (grouped), or stacked if stacked=true. */
  series: Array<Omit<CalcBarSeries, "key"> & { key: TSeriesKey }>;
  /** X-axis label (required, non-empty). */
  xLabel: string;
  /** Y-axis label (required, non-empty). */
  yLabel: string;
  /**
   * Render function for tooltip content, receives the hovered category row.
   * Default renders `${categoryKey}` header + one line per series with its label+value.
   */
  tooltipFormat?: (
    row: TRow,
    series: Array<Omit<CalcBarSeries, "key"> & { key: TSeriesKey }>
  ) => ReactNode;
  /** Stacked (true) vs grouped side-by-side (false, default). */
  stacked?: boolean;
  /** Show legend under the chart (default true when multiple series). */
  showLegend?: boolean;
  /** Format y-axis tick values (default: formatTick from helpers). */
  yTickFormat?: (value: number) => string;
  /** Reserved container height in px (default 280; add 32 if showLegend). */
  height?: number;
  /** Accessible name for the chart's SVG. */
  ariaLabel?: string;
  /** Optional horizontal reference line overlays (e.g. limit indicators). Only `y` is supported on bar charts. */
  referenceLines?: ReferenceLineSpec[];
}

type InnerProps<
  TRow extends object,
  TCategoryKey extends keyof TRow & string,
  TSeriesKey extends keyof TRow & string,
> = Required<
  Pick<
    CalcBarChartProps<TRow, TCategoryKey, TSeriesKey>,
    "data" | "categoryKey" | "series" | "xLabel" | "yLabel" | "stacked" | "yTickFormat"
  >
> & {
  tooltipFormat?: CalcBarChartProps<TRow, TCategoryKey, TSeriesKey>["tooltipFormat"];
  referenceLines?: ReferenceLineSpec[];
  width: number;
  height: number;
};

function BarChartInner<
  TRow extends object,
  TCategoryKey extends keyof TRow & string,
  TSeriesKey extends keyof TRow & string,
>({
  data,
  categoryKey,
  series,
  xLabel,
  yLabel,
  tooltipFormat,
  stacked,
  yTickFormat,
  referenceLines,
  width,
  height,
}: InnerProps<TRow, TCategoryKey, TSeriesKey>) {
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } =
    useTooltip<TRow>();

  const { xScale, yScale, subXScale, yTicks, innerWidth, innerHeight } = useMemo(() => {
    const innerW = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
    const innerH = Math.max(0, height - CHART_MARGIN.top - CHART_MARGIN.bottom);

    const categories = data.map((d) => String(d[categoryKey]));

    // Compute y-domain based on stacked vs grouped mode.
    const yValues: number[] = [];
    for (const row of data) {
      if (stacked) {
        const sum = series.reduce((acc, s) => acc + Number(row[s.key] ?? 0), 0);
        yValues.push(sum);
      } else {
        for (const s of series) yValues.push(Number(row[s.key] ?? 0));
      }
    }
    const yMin = Math.min(0, ...yValues);
    const yMax = Math.max(0, ...yValues);
    const yRange = yMax - yMin || 1;
    const yT = niceTicks(yMin, yMax + yRange * 0.05, 5);

    const xScale = scaleBand<string>({
      domain: categories,
      range: [0, innerW],
      padding: 0.2,
    });
    const subXScale = scaleBand<string>({
      domain: series.map((s) => s.key),
      range: [0, xScale.bandwidth()],
      padding: 0.05,
    });
    const yScale = scaleLinear<number>({
      domain: [yT[0], yT[yT.length - 1]],
      range: [innerH, 0],
    });

    return { xScale, yScale, subXScale, yTicks: yT, innerWidth: innerW, innerHeight: innerH };
  }, [data, categoryKey, series, stacked, width, height]);

  if (innerWidth < 10 || innerHeight < 10) return null;

  const handlePointerMove = (event: React.PointerEvent<SVGRectElement>, row: TRow) => {
    const svgRect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    const cat = String(row[categoryKey]);
    const bx = (xScale(cat) ?? 0) + xScale.bandwidth() / 2;
    showTooltip({
      tooltipData: row,
      tooltipLeft: CHART_MARGIN.left + bx,
      tooltipTop: event.clientY - svgRect.top,
    });
  };

  const defaultTooltipRenderer = (
    row: TRow,
    srs: Array<Omit<CalcBarSeries, "key"> & { key: TSeriesKey }>
  ) => (
    <>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{String(row[categoryKey])}</div>
      {srs.map((s, i) => {
        const color = s.color ?? DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
        const value = row[s.key];
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />
            <span>{s.label}: {typeof value === "number" ? formatTick(value) : String(value)}</span>
          </div>
        );
      })}
    </>
  );

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
          {data.map((row, ri) => {
            const cat = String(row[categoryKey]);
            const groupX = xScale(cat) ?? 0;
            const groupW = xScale.bandwidth();

            return (
              <g key={`g-${cat}-${ri}`} transform={`translate(${groupX},0)`}>
                {/* Wide hover capture so the whole category column triggers tooltip */}
                <rect
                  x={0}
                  y={0}
                  width={groupW}
                  height={innerHeight}
                  fill="transparent"
                  style={{ touchAction: "pan-y" }}
                  onPointerMove={(e) => handlePointerMove(e, row)}
                  onPointerLeave={hideTooltip}
                  onPointerCancel={hideTooltip}
                />
                {(() => {
                  let stackTotal = 0;
                  return series.map((s, si) => {
                    const value = Number(row[s.key] ?? 0);
                    const color = s.color ?? DEFAULT_BAR_COLORS[si % DEFAULT_BAR_COLORS.length];
                    if (stacked) {
                      const y = yScale(stackTotal + value);
                      const h = Math.max(0, yScale(stackTotal) - y);
                      stackTotal += value;
                      return <Bar key={s.key} x={0} y={y} width={groupW} height={h} fill={color} />;
                    }
                    const subX = subXScale(s.key) ?? 0;
                    const subW = subXScale.bandwidth();
                    const y = yScale(Math.max(value, 0));
                    const h = Math.abs(yScale(value) - yScale(0));
                    return <Bar key={s.key} x={subX} y={y} width={subW} height={h} fill={color} />;
                  });
                })()}
              </g>
            );
          })}
          {referenceLines?.map((ref, i) => {
            if (ref.y === undefined) return null;
            const ry = yScale(ref.y);
            const color = ref.color ?? "#94a3b8";
            const dashArray = ref.dashed === false ? undefined : "4 4";
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
          })}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
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

function Legend({ series }: { series: CalcBarSeries[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs pt-2">
      {series.map((s, i) => {
        const color = s.color ?? DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CalcBarChart<
  TRow extends object,
  TCategoryKey extends keyof TRow & string,
  TSeriesKey extends keyof TRow & string,
>({
  data,
  categoryKey,
  series,
  xLabel,
  yLabel,
  tooltipFormat,
  stacked = false,
  showLegend,
  yTickFormat = formatTick,
  height = 280,
  ariaLabel,
  referenceLines,
}: CalcBarChartProps<TRow, TCategoryKey, TSeriesKey>) {
  // Dev-mode contract warnings — once per distinct prop shape, not every render.
  const warnedFor = useRef<string>("");
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const signature = `${xLabel.trim() === ""}|${yLabel.trim() === ""}|${data.length === 0}|${series.length === 0}`;
    if (signature === warnedFor.current) return;
    warnedFor.current = signature;
    if (!xLabel.trim()) console.warn("CalcBarChart: xLabel must be a non-empty string");
    if (!yLabel.trim()) console.warn("CalcBarChart: yLabel must be a non-empty string");
    if (data.length === 0) console.warn("CalcBarChart: data is empty — nothing to render");
    if (series.length === 0) console.warn("CalcBarChart: series is empty — specify at least one bar series");
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
            <BarChartInner
              data={data}
              categoryKey={categoryKey}
              series={series}
              xLabel={xLabel}
              yLabel={yLabel}
              tooltipFormat={tooltipFormat}
              stacked={stacked}
              yTickFormat={yTickFormat}
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
