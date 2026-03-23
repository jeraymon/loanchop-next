import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { convertUnit } from "@/shared-math/units";
import { solveForce, solveMass, solveAcceleration } from "./calc";

describe("force calculator formulas", () => {
  it("solves for force: 10 kg × 9.81 m/s² ≈ 98.1 N", () => {
    expect(solveForce(new BigNumber(10), new BigNumber(9.81)).toNumber()).toBeCloseTo(98.1, 4);
  });

  it("solves for mass: 100 N / 10 m/s² = 10 kg", () => {
    expect(solveMass(new BigNumber(100), new BigNumber(10)).toNumber()).toBeCloseTo(10, 8);
  });

  it("solves for acceleration: 100 N / 10 kg = 10 m/s²", () => {
    expect(solveAcceleration(new BigNumber(100), new BigNumber(10)).toNumber()).toBeCloseTo(10, 8);
  });

  it("F = 1 kg × 1 m/s² = 1 N (definition of newton)", () => {
    expect(solveForce(new BigNumber(1), new BigNumber(1)).toNumber()).toBe(1);
  });

  it("handles unit conversion: force in pound force", () => {
    const forceN = solveForce(new BigNumber(10), new BigNumber(9.81));
    const forceLbf = convertUnit(forceN, "newton", "pound force", "force");
    expect(forceLbf.toNumber()).toBeCloseTo(22.05, 1);
  });

  it("handles unit conversion: mass in pounds, acceleration in ft/s²", () => {
    const massKg = convertUnit(new BigNumber(10), "pound", "kilogram", "mass");
    const accMs2 = convertUnit(new BigNumber(32.174), "foot/second^2", "meter/second^2", "acceleration");
    const force = solveForce(massKg, accMs2);
    expect(force.toNumber()).toBeCloseTo(44.48, 0);
  });

  it("round-trip: force → mass → force matches", () => {
    const force = 250, acc = 9.81;
    const mass = solveMass(new BigNumber(force), new BigNumber(acc));
    const forceBack = solveForce(mass, new BigNumber(acc));
    expect(forceBack.toNumber()).toBeCloseTo(force, 8);
  });
});
