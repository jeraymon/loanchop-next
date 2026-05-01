/**
 * Shared utilities used by every chart component in this directory.
 * Kept stateless so the same functions work for line, area, and bar charts.
 */

export const CHART_MARGIN = { top: 10, right: 20, bottom: 55, left: 65 };

/** Default stroke / fill colors, chosen for neutral legibility in both themes. */
export const DEFAULT_LINE_COLOR = "#64748b"; // slate-500
export const DEFAULT_DOT_COLOR = "#16a34a"; // green-600
export const DEFAULT_BAR_COLORS = [
  "#0e7490", // cyan-700  — brand primary
  "#94a3b8", // slate-400 — neutral secondary
  "#0891b2", // cyan-600
  "#64748b", // slate-500
  "#22c55e", // green-500
  "#f97316", // orange-500
];

/**
 * Reference line overlay — vertical if `x` is set, horizontal if `y` is set.
 * Label (if provided) renders at a fixed position: top-left for vertical lines,
 * inside-right aligned for horizontal lines. If you need configurable label
 * placement in a future calc, add a `labelPosition` prop and honor it in all
 * three chart components at once — do not declare it until it's implemented.
 */
export interface ReferenceLineSpec {
  x?: number;
  y?: number;
  color?: string;
  dashed?: boolean;
  label?: string;
}

/**
 * Produce evenly-spaced round-number tick positions. Matches the "nice ticks"
 * algorithm used across the calculator suite before visx migration so axis
 * labels stay predictable.
 */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];

  const safeCount = Number.isFinite(count) && count >= 2 ? Math.floor(count) : 5;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);

  if (lo === hi) {
    const delta = lo === 0 ? 1 : Math.abs(lo) * 0.01;
    const low = lo - delta;
    const high = lo + delta;
    return Number.isFinite(low) && Number.isFinite(high) && low !== high
      ? [low, lo, high]
      : [lo];
  }

  const range = hi - lo;
  if (!Number.isFinite(range) || range <= 0) return [lo, hi];

  const rawStep = range / (safeCount - 1);
  if (!Number.isFinite(rawStep) || rawStep <= 0) return [lo, hi];

  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  if (!Number.isFinite(mag) || mag <= 0) return [lo, hi];

  const normStep = rawStep / mag;
  let step: number;
  if (normStep <= 1) step = 1;
  else if (normStep <= 2) step = 2;
  else if (normStep <= 2.5) step = 2.5;
  else if (normStep <= 5) step = 5;
  else step = 10;
  step *= mag;
  if (!Number.isFinite(step) || step <= 0) return [lo, hi];

  const niceMin = Math.floor(lo / step) * step;
  const niceMax = Math.ceil(hi / step) * step;
  if (!Number.isFinite(niceMin) || !Number.isFinite(niceMax)) return [lo, hi];

  const ticks: number[] = [];
  const maxTicks = safeCount + 2;
  for (let t = niceMin; t <= niceMax + step / 2 && ticks.length < maxTicks; t += step) {
    ticks.push(parseFloat(t.toPrecision(12)));
  }
  return ticks.length > 0 ? ticks : [lo, hi];
}

/** Format an axis tick value — integer if whole, else 2-decimal trimmed. */
export function formatTick(value: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(2)).toString();
}
