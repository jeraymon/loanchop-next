import BigNumber from "bignumber.js";

// Configure bignumber.js for 64-digit precision globally
BigNumber.config({ DECIMAL_PLACES: 64 });

export { BigNumber };

/** High-precision π (64 digits) */
export const PI = new BigNumber(
  "3.141592653589793238462643383279502884197169399375105820974944",
);

/** High-precision 2π */
export const TWO_PI = PI.times(2);

export function formatResult(value: BigNumber, precision = 8): string {
  if (value === null || value === undefined) return "";
  const abs = value.abs();
  // Use scientific notation for very large or very small numbers
  if (!abs.isZero() && (abs.gte(1e12) || abs.lt(1e-4))) {
    return value.toExponential(precision - 1).replace(/\.?0+e/, "e");
  }
  // toPrecision can return either fixed ("18000000", "9.81000000") or scientific
  // ("1.2723444e+10") notation depending on magnitude vs precision. Strip trailing
  // zeros only where they're padding from precision — never from whole-number
  // integers (turned 18000000 → 18) and never from exponents (turned e+10 → e+1).
  const s = value.toPrecision(precision);
  if (s.includes("e") || s.includes("E")) {
    // Scientific: clean trailing zeros from the mantissa only (.5000000e → .5e)
    return s.replace(/\.?0+e/i, "e");
  }
  if (!s.includes(".")) return s;
  return s.replace(/0+$/, "").replace(/\.$/, "");
}