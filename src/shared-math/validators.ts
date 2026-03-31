import { z } from "zod";

/** String field, required, must be a positive number (> 0) */
export const positiveNum = z
  .string()
  .min(1, "Required")
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number");

/** String field, required, must be any valid number */
export const anyNum = z
  .string()
  .min(1, "Required")
  .refine((v) => !isNaN(Number(v)), "Must be a number");

/** String field, required, must be non-negative (>= 0) */
export const nonNegNum = z
  .string()
  .min(1, "Required")
  .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a non-negative number");

/** String field, required, must be a positive integer (> 0, whole number) */
export const posInt = z
  .string()
  .min(1, "Required")
  .refine(
    (v) => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) > 0,
    "Must be a positive integer",
  );

/** String field, required, must be a non-zero integer */
export const nonZeroInt = z
  .string()
  .min(1, "Required")
  .refine(
    (v) => !isNaN(Number(v)) && Number.isInteger(Number(v)) && Number(v) !== 0,
    "Must be a non-zero integer",
  );
