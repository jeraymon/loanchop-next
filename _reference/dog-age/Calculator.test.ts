import { describe, it, expect } from "vitest";
import { calcDogAge } from "./calc-dog-age";

describe("Dog Age Calculator — calcDogAge", () => {
  // Phase 1: 0–1 calendar year → 0–15 human years (linear)
  it("returns 0 for age 0", () => {
    expect(calcDogAge(0, 12)).toBe(0);
  });

  it("returns 0 for negative age", () => {
    expect(calcDogAge(-1, 12)).toBe(0);
  });

  it("scales linearly to 15 at age 1", () => {
    expect(calcDogAge(1, 12)).toBe(15);
  });

  it("handles fractional first year (6 months)", () => {
    expect(calcDogAge(0.5, 12)).toBeCloseTo(7.5, 4);
  });

  // Phase 2: 1–2 calendar years → 15–24 human years (linear +9)
  it("returns 24 at age 2", () => {
    expect(calcDogAge(2, 12)).toBe(24);
  });

  it("handles fractional second year (1.5 years)", () => {
    expect(calcDogAge(1.5, 12)).toBeCloseTo(19.5, 4);
  });

  // Phase 3: 2+ years → linear rate based on breed lifespan
  // rate = (68 - 15 - 9) / (lifeExpectancy - 2) = 44 / (LE - 2)
  it("computes age 5 for a 12-year breed", () => {
    // rate = 44 / (12 - 2) = 4.4/yr
    // 24 + 4.4 * 3 = 37.2
    expect(calcDogAge(5, 12)).toBeCloseTo(37.2, 4);
  });

  it("computes age 10 for a 12-year breed", () => {
    // 24 + 4.4 * 8 = 59.2
    expect(calcDogAge(10, 12)).toBeCloseTo(59.2, 4);
  });

  it("computes age 12 for a 12-year breed (at life expectancy)", () => {
    // 24 + 4.4 * 10 = 68
    expect(calcDogAge(12, 12)).toBeCloseTo(68, 4);
  });

  it("computes age for a short-lived breed (8 years)", () => {
    // rate = 44 / (8 - 2) = 7.333.../yr
    // age 5: 24 + 7.333... * 3 = 46
    expect(calcDogAge(5, 8)).toBeCloseTo(46, 4);
  });

  it("computes age for a long-lived breed (16 years)", () => {
    // rate = 44 / (16 - 2) = 3.1428.../yr
    // age 10: 24 + 3.1428... * 8 = 49.1428...
    expect(calcDogAge(10, 16)).toBeCloseTo(49.1429, 3);
  });

  // Custom parameters
  it("accepts custom firstYearAging", () => {
    // firstYearAging = 20, age = 0.5 → 10
    expect(calcDogAge(0.5, 12, 20)).toBeCloseTo(10, 4);
  });

  it("accepts custom secondYearAging", () => {
    // firstYearAging = 15, secondYearAging = 12, age = 2 → 15 + 12 = 27
    expect(calcDogAge(2, 12, 15, 12)).toBe(27);
  });

  it("accepts custom humanLifeExpectancy", () => {
    // humanLE = 80, rate = (80 - 15 - 9) / (12 - 2) = 56/10 = 5.6/yr
    // age 5: 24 + 5.6 * 3 = 40.8
    expect(calcDogAge(5, 12, 15, 9, 80)).toBeCloseTo(40.8, 4);
  });

  // Round-trip: at breed life expectancy, human age should equal humanLifeExpectancy
  it("reaches humanLifeExpectancy at breedLifeExpectancy", () => {
    const breeds = [8, 10, 12, 14, 16];
    for (const le of breeds) {
      expect(calcDogAge(le, le)).toBeCloseTo(68, 4);
    }
  });
});
