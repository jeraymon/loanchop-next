import BigNumber from "bignumber.js";

/** Monthly payment: M = P × r(1+r)^n / ((1+r)^n - 1) */
export function calcMonthlyPayment(P: BigNumber, annualRatePct: BigNumber, years: BigNumber): BigNumber {
  const r = annualRatePct.div(1200);
  const n = years.times(12);
  const rn = Math.pow(r.plus(1).toNumber(), n.toNumber());
  const rnBN = new BigNumber(rn);
  return P.times(r.times(rnBN)).div(rnBN.minus(1));
}

/** Loan amount: P = M × ((1+r)^n - 1) / (r(1+r)^n) */
export function calcLoanAmount(M: BigNumber, annualRatePct: BigNumber, years: BigNumber): BigNumber {
  const r = annualRatePct.div(1200);
  const n = years.times(12);
  const rn = Math.pow(r.plus(1).toNumber(), n.toNumber());
  const rnBN = new BigNumber(rn);
  return M.times(rnBN.minus(1)).div(r.times(rnBN));
}

/** Years: n = -ln(1 - Pr/M) / ln(1+r), returns years (months/12). Returns null if payment too low. */
export function calcLoanYears(P: BigNumber, annualRatePct: BigNumber, M: BigNumber): BigNumber | null {
  const r = annualRatePct.div(1200);
  const prOverM = P.times(r).div(M).toNumber();
  if (prOverM >= 1) return null;
  const nMonths = -Math.log(1 - prOverM) / Math.log(r.plus(1).toNumber());
  return new BigNumber(nMonths).div(12);
}
