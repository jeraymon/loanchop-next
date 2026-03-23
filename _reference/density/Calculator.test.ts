import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { convertUnit } from "@/shared-math/units";
import { solveDensity, solveMass, solveVolume } from "./calc";

describe("density calculator formulas", () => {
  it("solves for density: 10 kg / 2 m³ = 5 kg/m³", () => {
    expect(solveDensity(new BigNumber(10), new BigNumber(2)).toNumber()).toBeCloseTo(5, 8);
  });

  it("solves for mass: 5 kg/m³ × 2 m³ = 10 kg", () => {
    expect(solveMass(new BigNumber(5), new BigNumber(2)).toNumber()).toBeCloseTo(10, 8);
  });

  it("solves for volume: 10 kg / 5 kg/m³ = 2 m³", () => {
    expect(solveVolume(new BigNumber(10), new BigNumber(5)).toNumber()).toBeCloseTo(2, 8);
  });

  it("water density: 1000 kg in 1 m³ = 1000 kg/m³", () => {
    expect(solveDensity(new BigNumber(1000), new BigNumber(1)).toNumber()).toBeCloseTo(1000, 8);
  });

  it("handles unit conversion: 1 pound in 1 foot^3", () => {
    const massKg = convertUnit(new BigNumber(1), "pound", "kilogram", "mass");
    const volM3 = convertUnit(new BigNumber(1), "foot^3", "meter^3", "volume");
    const density = solveDensity(massKg, volM3);
    expect(density.toNumber()).toBeCloseTo(16.0185, 2);
  });

  it("round-trip: density → mass → density matches", () => {
    const density = 997;
    const volume = 0.5;
    const mass = solveMass(new BigNumber(density), new BigNumber(volume));
    const densityBack = solveDensity(mass, new BigNumber(volume));
    expect(densityBack.toNumber()).toBeCloseTo(density, 8);
  });
});
