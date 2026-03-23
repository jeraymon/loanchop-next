import BigNumber from "bignumber.js";

// F = m × a
export function solveForce(m: BigNumber, a: BigNumber): BigNumber {
  return m.times(a);
}

// m = F / a
export function solveMass(F: BigNumber, a: BigNumber): BigNumber {
  return F.div(a);
}

// a = F / m
export function solveAcceleration(F: BigNumber, m: BigNumber): BigNumber {
  return F.div(m);
}
