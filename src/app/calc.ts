import { BigNumber } from "@/shared-math/math-config";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  extraPrincipal: number;
  remainingBalance: number;
  cumulativeInterest: number;
}

export interface ComparisonResult {
  normalSchedule: AmortizationRow[];
  acceleratedSchedule: AmortizationRow[];
  monthsSaved: number;
  interestSaved: number;
  normalTotalInterest: number;
  acceleratedTotalInterest: number;
  monthlyPayment: number;
}

// --------------------------------------------------------------------------
// Core calculations
// --------------------------------------------------------------------------

/**
 * Standard amortization monthly payment formula.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * where r = monthly rate, n = total months
 */
export function calcMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
): number {
  const P = new BigNumber(principal);
  const annualPct = new BigNumber(annualRate);
  const n = new BigNumber(years).times(12);

  // Edge case: 0% interest rate
  if (annualPct.isZero()) {
    return P.div(n).dp(2, BigNumber.ROUND_HALF_UP).toNumber();
  }

  const r = annualPct.div(100).div(12); // monthly rate
  const onePlusR = r.plus(1);
  const onePlusRpowN = onePlusR.pow(n.toNumber());

  // M = P * r * (1+r)^n / ((1+r)^n - 1)
  const numerator = P.times(r).times(onePlusRpowN);
  const denominator = onePlusRpowN.minus(1);

  return numerator.div(denominator).dp(2, BigNumber.ROUND_HALF_UP).toNumber();
}

/**
 * Build month-by-month amortization schedule with optional extra payments.
 */
export function buildAmortization(
  principal: number,
  annualRate: number,
  years: number,
  extraMonthlyPayment: number = 0,
): AmortizationRow[] {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, years);
  const annualPct = new BigNumber(annualRate);
  const isZeroRate = annualPct.isZero();
  const monthlyRate = isZeroRate
    ? new BigNumber(0)
    : annualPct.div(100).div(12);

  let balance = new BigNumber(principal);
  let cumulativeInterest = new BigNumber(0);
  const extra = new BigNumber(extraMonthlyPayment);
  const totalMonths = years * 12;
  const schedule: AmortizationRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    if (balance.lte(0)) break;

    const interestPortion = balance.times(monthlyRate).dp(2, BigNumber.ROUND_HALF_UP);
    let principalPortion = new BigNumber(monthlyPayment).minus(interestPortion);
    let actualExtra = new BigNumber(0);

    // Determine max principal that can be applied this month
    const maxPrincipalWithExtra = principalPortion.plus(extra);

    // Final payment: if balance fits within this month's principal + extra, or it's the last scheduled month
    if (balance.lte(maxPrincipalWithExtra) || month === totalMonths) {
      // Pay off the remaining balance exactly
      principalPortion = balance;
      actualExtra = new BigNumber(0);
      balance = new BigNumber(0);
    } else {
      // Normal month — apply extra
      actualExtra = BigNumber.min(extra, balance.minus(principalPortion));
      if (actualExtra.lt(0)) actualExtra = new BigNumber(0);
      balance = balance.minus(principalPortion).minus(actualExtra);
    }

    cumulativeInterest = cumulativeInterest.plus(interestPortion);

    const actualPayment = interestPortion.plus(principalPortion).plus(actualExtra);

    schedule.push({
      month,
      payment: actualPayment.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      interest: interestPortion.toNumber(),
      principal: principalPortion.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      extraPrincipal: actualExtra.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      remainingBalance: balance.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      cumulativeInterest: cumulativeInterest.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
    });

    if (balance.lte(0)) break;
  }

  return schedule;
}

/**
 * Compare schedules with and without extra payments.
 */
export function compareWithAndWithoutExtra(
  principal: number,
  annualRate: number,
  years: number,
  extraPayment: number,
): ComparisonResult {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, years);
  const normalSchedule = buildAmortization(principal, annualRate, years, 0);
  const acceleratedSchedule = buildAmortization(principal, annualRate, years, extraPayment);

  const normalTotalInterest = normalSchedule.length > 0
    ? normalSchedule[normalSchedule.length - 1].cumulativeInterest
    : 0;
  const acceleratedTotalInterest = acceleratedSchedule.length > 0
    ? acceleratedSchedule[acceleratedSchedule.length - 1].cumulativeInterest
    : 0;

  const monthsSaved = normalSchedule.length - acceleratedSchedule.length;
  const interestSaved = new BigNumber(normalTotalInterest)
    .minus(acceleratedTotalInterest)
    .dp(2, BigNumber.ROUND_HALF_UP)
    .toNumber();

  return {
    normalSchedule,
    acceleratedSchedule,
    monthsSaved,
    interestSaved,
    normalTotalInterest,
    acceleratedTotalInterest,
    monthlyPayment,
  };
}
