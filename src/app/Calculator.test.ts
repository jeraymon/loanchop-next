import { describe, it, expect } from "vitest";
import {
  calcMonthlyPayment,
  buildAmortization,
  compareWithAndWithoutExtra,
} from "./calc";

describe("calcMonthlyPayment", () => {
  it("30yr $200k @ 6% → ~$1199.10", () => {
    const result = calcMonthlyPayment(200_000, 6, 30);
    expect(result).toBeCloseTo(1199.1, 1);
  });

  it("15yr $200k @ 5% → ~$1581.59", () => {
    const result = calcMonthlyPayment(200_000, 5, 15);
    expect(result).toBeCloseTo(1581.59, 1);
  });

  it("0% interest rate → simple division", () => {
    const result = calcMonthlyPayment(120_000, 0, 10);
    expect(result).toBe(1000);
  });

  it("short term: 5yr $50k @ 4%", () => {
    const result = calcMonthlyPayment(50_000, 4, 5);
    expect(result).toBeCloseTo(921.0, 0);
  });
});

describe("buildAmortization", () => {
  it("first month has more interest than principal (high rate)", () => {
    const schedule = buildAmortization(200_000, 6, 30, 0);
    const first = schedule[0];
    expect(first.interest).toBeGreaterThan(first.principal);
  });

  it("last row balance ≈ 0", () => {
    const schedule = buildAmortization(200_000, 6, 30, 0);
    const last = schedule[schedule.length - 1];
    expect(last.remainingBalance).toBeCloseTo(0, 0);
  });

  it("schedule length equals term months with no extra", () => {
    const schedule = buildAmortization(200_000, 6, 30, 0);
    expect(schedule.length).toBe(360);
  });

  it("0% rate → all principal, no interest", () => {
    const schedule = buildAmortization(12_000, 0, 1, 0);
    expect(schedule.length).toBe(12);
    expect(schedule[0].interest).toBe(0);
    expect(schedule[0].principal).toBe(1000);
  });
});

describe("compareWithAndWithoutExtra", () => {
  it("extra payment of $200/mo saves significant interest and months", () => {
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 200);
    expect(result.monthsSaved).toBeGreaterThan(50);
    expect(result.interestSaved).toBeGreaterThan(50_000);
  });

  it("extra payments reduce total months", () => {
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 500);
    expect(result.acceleratedSchedule.length).toBeLessThan(
      result.normalSchedule.length,
    );
  });

  it("monthly payment matches calcMonthlyPayment", () => {
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 0);
    const direct = calcMonthlyPayment(200_000, 6, 30);
    expect(result.monthlyPayment).toBe(direct);
  });

  it("no extra payment → zero savings", () => {
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 0);
    expect(result.monthsSaved).toBe(0);
    expect(result.interestSaved).toBe(0);
  });
});
