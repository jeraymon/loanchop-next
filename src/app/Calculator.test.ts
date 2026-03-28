import { describe, it, expect } from "vitest";
import {
  calcMonthlyPayment,
  buildAmortization,
  compareWithAndWithoutExtra,
  type ExtraPaymentEntry,
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

  it("flat extra payment shortens schedule", () => {
    const normal = buildAmortization(200_000, 6, 30, 0);
    const withExtra = buildAmortization(200_000, 6, 30, 200);
    expect(withExtra.length).toBeLessThan(normal.length);
  });
});

describe("buildAmortization with per-row entries", () => {
  it("recurring entry from month 1 behaves like flat extra", () => {
    const entries: ExtraPaymentEntry[] = [{ month: 1, recurring: 200, single: 0 }];
    const withEntries = buildAmortization(200_000, 6, 30, 0, entries);
    const withFlat = buildAmortization(200_000, 6, 30, 200);
    expect(withEntries.length).toBe(withFlat.length);
    // Total interest should match
    const entriesInterest = withEntries[withEntries.length - 1].cumulativeInterest;
    const flatInterest = withFlat[withFlat.length - 1].cumulativeInterest;
    expect(entriesInterest).toBeCloseTo(flatInterest, 0);
  });

  it("recurring entry starting mid-loan shortens schedule", () => {
    const normal = buildAmortization(200_000, 6, 30, 0);
    const entries: ExtraPaymentEntry[] = [{ month: 60, recurring: 500, single: 0 }];
    const withRecurring = buildAmortization(200_000, 6, 30, 0, entries);
    expect(withRecurring.length).toBeLessThan(normal.length);
    // First 59 months should be identical to normal
    for (let i = 0; i < 59; i++) {
      expect(withRecurring[i].remainingBalance).toBeCloseTo(normal[i].remainingBalance, 1);
    }
  });

  it("single entry reduces balance at that specific month only", () => {
    const entries: ExtraPaymentEntry[] = [{ month: 12, recurring: 0, single: 10_000 }];
    const normal = buildAmortization(200_000, 6, 30, 0);
    const withSingle = buildAmortization(200_000, 6, 30, 0, entries);
    // Before month 12, balances should be the same
    expect(withSingle[10].remainingBalance).toBeCloseTo(normal[10].remainingBalance, 1);
    // After month 12, balance should be lower by ~$10k
    expect(withSingle[12].remainingBalance).toBeLessThan(normal[12].remainingBalance - 9_000);
    // Schedule should be shorter
    expect(withSingle.length).toBeLessThan(normal.length);
  });

  it("combined recurring + single entries", () => {
    const entries: ExtraPaymentEntry[] = [
      { month: 1, recurring: 100, single: 0 },
      { month: 24, recurring: 0, single: 5000 },
    ];
    const normal = buildAmortization(200_000, 6, 30, 0);
    const withBoth = buildAmortization(200_000, 6, 30, 0, entries);
    expect(withBoth.length).toBeLessThan(normal.length);
    // Cumulative interest should be less
    const normalInterest = normal[normal.length - 1].cumulativeInterest;
    const bothInterest = withBoth[withBoth.length - 1].cumulativeInterest;
    expect(bothInterest).toBeLessThan(normalInterest);
  });

  it("later recurring entry overrides earlier one", () => {
    const entries: ExtraPaymentEntry[] = [
      { month: 1, recurring: 100, single: 0 },
      { month: 60, recurring: 500, single: 0 },
    ];
    const withOverride = buildAmortization(200_000, 6, 30, 0, entries);
    // Just recurring 100 the whole time
    const justHundred: ExtraPaymentEntry[] = [{ month: 1, recurring: 100, single: 0 }];
    const withHundred = buildAmortization(200_000, 6, 30, 0, justHundred);
    // Override should pay off faster (500 > 100 after month 60)
    expect(withOverride.length).toBeLessThan(withHundred.length);
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

  it("per-row entries are used when provided", () => {
    const entries: ExtraPaymentEntry[] = [{ month: 1, recurring: 200, single: 0 }];
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 0, entries);
    expect(result.monthsSaved).toBeGreaterThan(50);
    expect(result.interestSaved).toBeGreaterThan(50_000);
  });
});
