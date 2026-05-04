import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { formatResult } from "./math-config";

describe("formatResult", () => {
  it("formats a simple number", () => {
    expect(formatResult(new BigNumber("123.4567"))).toBe("123.4567");
  });

  it("strips trailing zeros", () => {
    expect(formatResult(new BigNumber("10"))).toBe("10");
    expect(formatResult(new BigNumber("10.50"))).toBe("10.5");
    expect(formatResult(new BigNumber("100.0000"))).toBe("100");
  });

  it("respects custom precision", () => {
    expect(formatResult(new BigNumber("1.23456789"), 3)).toBe("1.23");
    expect(formatResult(new BigNumber("1.23456789"), 8)).toBe("1.2345679");
  });

  it("uses e-notation for very small numbers (< 1e-4)", () => {
    expect(formatResult(new BigNumber("0.00001234"))).toBe("1.234e-5");
  });

  it("uses e-notation for very large numbers (>= 1e12)", () => {
    expect(formatResult(new BigNumber("1234567890123"))).toBe("1.2345679e+12");
  });

  it("keeps moderately large numbers without e-notation when within precision", () => {
    expect(formatResult(new BigNumber("12345678"))).toBe("12345678");
    // 9+ integer digits exceeds 8 sig figs, so toPrecision uses e-notation
    expect(formatResult(new BigNumber("123456789"))).toBe("1.2345679e+8");
  });

  it("handles zero", () => {
    expect(formatResult(new BigNumber(0))).toBe("0");
  });

  it("handles negative numbers", () => {
    expect(formatResult(new BigNumber("-5.5000"))).toBe("-5.5");
  });

  it("returns empty string for null/undefined", () => {
    expect(formatResult(null as unknown as BigNumber)).toBe("");
    expect(formatResult(undefined as unknown as BigNumber)).toBe("");
  });

  // Regression: the earlier `/\.?0+$/` regex stripped trailing zeros from
  // toPrecision() output indiscriminately, breaking two distinct cases.
  describe("regression — toPrecision trailing-zero handling", () => {
    it("preserves trailing zeros in whole numbers", () => {
      // toPrecision(8) returns "18000000" (no decimal) — must not become "18"
      expect(formatResult(new BigNumber(18000000))).toBe("18000000");
      expect(formatResult(new BigNumber(100))).toBe("100");
      expect(formatResult(new BigNumber(1000))).toBe("1000");
      expect(formatResult(new BigNumber(-18000000))).toBe("-18000000");
    });

    it("preserves trailing zeros in scientific-notation exponents", () => {
      // 1.27e10 has integer-part > precision → toPrecision returns "1.2723444e+10"
      // The trailing "0" of the EXPONENT must not be stripped (would yield e+1).
      expect(formatResult(new BigNumber("12723443971.2"))).toBe("1.2723444e+10");
      // Exponent ending in 0 with integer mantissa
      expect(formatResult(new BigNumber("10000000000"))).toBe("1e+10");
      // Exponent +20
      expect(formatResult(new BigNumber("3.5e9"))).toBe("3.5e+9");
    });

    it("still strips trailing zeros after a decimal point in fixed notation", () => {
      expect(formatResult(new BigNumber("9.8100000"))).toBe("9.81");
      expect(formatResult(new BigNumber("100.500"))).toBe("100.5");
    });
  });
});
