import { z } from "zod";

const toFiniteNumber = (value: string): number | null => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

/** String field, required, must be a positive number (> 0) */
export const positiveNum = z
  .string()
  .min(1, "Required")
  .refine((v) => {
    const n = toFiniteNumber(v);
    return n !== null && n > 0;
  }, "Must be a positive number");

/** String field, required, must be any valid number */
export const anyNum = z
  .string()
  .min(1, "Required")
  .refine((v) => toFiniteNumber(v) !== null, "Must be a number");

/** String field, required, must be non-negative (>= 0) */
export const nonNegNum = z
  .string()
  .min(1, "Required")
  .refine((v) => {
    const n = toFiniteNumber(v);
    return n !== null && n >= 0;
  }, "Must be a non-negative number");

/** String field, required, must be a positive integer (> 0, whole number) */
export const posInt = z
  .string()
  .min(1, "Required")
  .refine(
    (v) => {
      const n = toFiniteNumber(v);
      return n !== null && Number.isInteger(n) && n > 0;
    },
    "Must be a positive integer",
  );

/** String field, required, must be a non-zero integer */
export const nonZeroInt = z
  .string()
  .min(1, "Required")
  .refine(
    (v) => {
      const n = toFiniteNumber(v);
      return n !== null && Number.isInteger(n) && n !== 0;
    },
    "Must be a non-zero integer",
  );
