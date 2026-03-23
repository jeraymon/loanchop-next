import BigNumber from "bignumber.js";

// ρ = m / V
export function solveDensity(m: BigNumber, V: BigNumber): BigNumber {
  return m.div(V);
}

// m = ρ × V
export function solveMass(density: BigNumber, V: BigNumber): BigNumber {
  return density.times(V);
}

// V = m / ρ
export function solveVolume(m: BigNumber, density: BigNumber): BigNumber {
  return m.div(density);
}
