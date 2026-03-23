import { describe, it, expect } from "vitest";
import BigNumber from "bignumber.js";
import { calcMonthlyPayment, calcLoanAmount, calcLoanYears } from "./calc";

describe("Loan Calculator", () => {
  it("calculates monthly payment for $200,000 at 6% for 30 years", () => {
    const M = calcMonthlyPayment(new BigNumber(200000), new BigNumber(6), new BigNumber(30)).toNumber();
    expect(M).toBeCloseTo(1199.10, 0);
  });

  it("calculates monthly payment for $25,000 auto loan at 5% for 5 years", () => {
    const M = calcMonthlyPayment(new BigNumber(25000), new BigNumber(5), new BigNumber(5)).toNumber();
    expect(M).toBeCloseTo(471.78, 0);
  });

  it("calculates loan amount from monthly payment", () => {
    const P = calcLoanAmount(new BigNumber(1199.10), new BigNumber(6), new BigNumber(30)).toNumber();
    expect(P).toBeCloseTo(200000, -1);
  });

  it("calculates loan term in years", () => {
    const years = calcLoanYears(new BigNumber(200000), new BigNumber(6), new BigNumber(1199.10));
    expect(years!.toNumber()).toBeCloseTo(30, 0);
  });

  it("returns null when payment is too low", () => {
    const years = calcLoanYears(new BigNumber(200000), new BigNumber(6), new BigNumber(500));
    expect(years).toBeNull();
  });

  it("total interest for a 30-year loan", () => {
    const M = calcMonthlyPayment(new BigNumber(200000), new BigNumber(6), new BigNumber(30)).toNumber();
    const totalPaid = M * 360;
    const totalInterest = totalPaid - 200000;
    expect(totalInterest).toBeCloseTo(231676, -2);
  });

  it("round-trips payment → loan amount → payment", () => {
    const P = new BigNumber(150000);
    const rate = new BigNumber(4.5);
    const years = new BigNumber(15);
    const M = calcMonthlyPayment(P, rate, years);
    const PBack = calcLoanAmount(M, rate, years).toNumber();
    expect(PBack).toBeCloseTo(150000, 0);
  });
});
