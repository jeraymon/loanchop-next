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
  cumulativePayment: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

/** Per-month extra payment override entered by the user in the table. */
export interface ExtraPaymentEntry {
  month: number;
  recurring: number;
  single: number;
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
 * Resolve the effective recurring extra for each month.
 * A recurring entry at month M sets the recurring amount for M and all
 * subsequent months (until a later recurring entry overrides it).
 */
function resolveRecurring(
  entries: ExtraPaymentEntry[],
  totalMonths: number,
): { recurring: number; single: number }[] {
  // Build sparse maps
  const recurringByMonth = new Map<number, number>();
  const singleByMonth = new Map<number, number>();
  for (const e of entries) {
    if (e.recurring > 0) recurringByMonth.set(e.month, e.recurring);
    if (e.single > 0) singleByMonth.set(e.month, e.single);
  }

  const result: { recurring: number; single: number }[] = [];
  let currentRecurring = 0;

  for (let m = 1; m <= totalMonths; m++) {
    if (recurringByMonth.has(m)) {
      currentRecurring = recurringByMonth.get(m)!;
    }
    result.push({
      recurring: currentRecurring,
      single: singleByMonth.get(m) ?? 0,
    });
  }
  return result;
}

/**
 * Build month-by-month amortization schedule.
 *
 * Supports three modes:
 * 1. No extras (default) — standard amortization
 * 2. Flat extra — same extra every month (legacy API, `extraMonthlyPayment`)
 * 3. Per-row extras — array of `ExtraPaymentEntry` with recurring + single
 */
export function buildAmortization(
  principal: number,
  annualRate: number,
  years: number,
  extraMonthlyPayment: number = 0,
  extraEntries?: ExtraPaymentEntry[],
): AmortizationRow[] {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, years);
  const annualPct = new BigNumber(annualRate);
  const isZeroRate = annualPct.isZero();
  const monthlyRate = isZeroRate
    ? new BigNumber(0)
    : annualPct.div(100).div(12);

  const totalMonths = years * 12;

  // Resolve per-month extras
  const perMonth =
    extraEntries && extraEntries.length > 0
      ? resolveRecurring(extraEntries, totalMonths)
      : null;

  let balance = new BigNumber(principal);
  let cumulativePayment = new BigNumber(0);
  let cumulativeInterest = new BigNumber(0);
  let cumulativePrincipal = new BigNumber(0);
  const schedule: AmortizationRow[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    if (balance.lte(0)) break;

    // Determine extra for this month
    let extraThisMonth: BigNumber;
    if (perMonth) {
      const pm = perMonth[month - 1];
      extraThisMonth = new BigNumber(pm.recurring).plus(pm.single);
    } else {
      extraThisMonth = new BigNumber(extraMonthlyPayment);
    }

    const interestPortion = balance.times(monthlyRate).dp(2, BigNumber.ROUND_HALF_UP);
    const regularPrincipal = new BigNumber(monthlyPayment).minus(interestPortion);
    let principalPortion: BigNumber;
    let actualExtra = new BigNumber(0);

    // Amount needed to pay off the loan this month
    const payoffNeeded = balance;

    if (payoffNeeded.lte(regularPrincipal) || month === totalMonths) {
      // Regular principal alone covers payoff (or it's the last month)
      principalPortion = payoffNeeded;
      actualExtra = new BigNumber(0);
      balance = new BigNumber(0);
    } else if (payoffNeeded.lte(regularPrincipal.plus(extraThisMonth))) {
      // Regular principal + partial extra covers payoff
      principalPortion = regularPrincipal;
      actualExtra = payoffNeeded.minus(regularPrincipal);
      balance = new BigNumber(0);
    } else {
      // Normal month — full extra applied
      principalPortion = regularPrincipal;
      actualExtra = BigNumber.min(extraThisMonth, balance.minus(principalPortion));
      if (actualExtra.lt(0)) actualExtra = new BigNumber(0);
      balance = balance.minus(principalPortion).minus(actualExtra);
    }

    const actualPayment = interestPortion.plus(principalPortion).plus(actualExtra);
    cumulativePayment = cumulativePayment.plus(actualPayment);
    cumulativeInterest = cumulativeInterest.plus(interestPortion);
    cumulativePrincipal = cumulativePrincipal.plus(principalPortion).plus(actualExtra);

    schedule.push({
      month,
      payment: actualPayment.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      interest: interestPortion.toNumber(),
      principal: principalPortion.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      extraPrincipal: actualExtra.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      remainingBalance: balance.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      cumulativePayment: cumulativePayment.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      cumulativeInterest: cumulativeInterest.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
      cumulativePrincipal: cumulativePrincipal.dp(2, BigNumber.ROUND_HALF_UP).toNumber(),
    });

    if (balance.lte(0)) break;
  }

  return schedule;
}

/**
 * Compare schedules with and without extra payments.
 * Accepts either a flat extra amount or per-row entries.
 */
export function compareWithAndWithoutExtra(
  principal: number,
  annualRate: number,
  years: number,
  extraPayment: number,
  extraEntries?: ExtraPaymentEntry[],
): ComparisonResult {
  const monthlyPayment = calcMonthlyPayment(principal, annualRate, years);
  const normalSchedule = buildAmortization(principal, annualRate, years, 0);
  const acceleratedSchedule =
    extraEntries && extraEntries.length > 0
      ? buildAmortization(principal, annualRate, years, 0, extraEntries)
      : buildAmortization(principal, annualRate, years, extraPayment);

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
