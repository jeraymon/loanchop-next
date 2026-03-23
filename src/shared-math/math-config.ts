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
  return value.toPrecision(precision).replace(/\.?0+$/, "");
}