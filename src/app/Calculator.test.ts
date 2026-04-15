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

// Helper: expand a recurring amount over a month range (inclusive).
// Matches what the UI's saveEdit does on a recurring edit.
function recurringRange(
  fromMonth: number,
  toMonth: number,
  amount: number,
): ExtraPaymentEntry[] {
  const out: ExtraPaymentEntry[] = [];
  for (let m = fromMonth; m <= toMonth; m++) {
    out.push({ month: m, recurring: amount, single: 0 });
  }
  return out;
}

describe("buildAmortization with per-row entries (per-month, no carry-forward)", () => {
  it("a single recurring entry at month 1 affects ONLY month 1 — not a flat extra", () => {
    // Regression: legacy bug over-applied recurring to every subsequent month,
    // paying off real loans years early (see Cory's report).
    const normal = buildAmortization(200_000, 6, 30, 0);
    const entries: ExtraPaymentEntry[] = [{ month: 1, recurring: 200, single: 0 }];
    const withOne = buildAmortization(200_000, 6, 30, 0, entries);
    // Schedule length should differ by at most a month — a single $200 bump
    // cannot meaningfully shorten a 30-year loan.
    expect(Math.abs(withOne.length - normal.length)).toBeLessThanOrEqual(1);
  });

  it("recurring expanded across all months equals flat extra", () => {
    const entries = recurringRange(1, 360, 200);
    const withEntries = buildAmortization(200_000, 6, 30, 0, entries);
    const withFlat = buildAmortization(200_000, 6, 30, 200);
    expect(withEntries.length).toBe(withFlat.length);
    const entriesInterest = withEntries[withEntries.length - 1].cumulativeInterest;
    const flatInterest = withFlat[withFlat.length - 1].cumulativeInterest;
    expect(entriesInterest).toBeCloseTo(flatInterest, 0);
  });

  it("recurring expanded from mid-loan onward shortens schedule; first months match normal", () => {
    const normal = buildAmortization(200_000, 6, 30, 0);
    const entries = recurringRange(60, 360, 500);
    const withRecurring = buildAmortization(200_000, 6, 30, 0, entries);
    expect(withRecurring.length).toBeLessThan(normal.length);
    for (let i = 0; i < 59; i++) {
      expect(withRecurring[i].remainingBalance).toBeCloseTo(normal[i].remainingBalance, 1);
    }
  });

  it("single entry reduces balance at that specific month only", () => {
    const entries: ExtraPaymentEntry[] = [{ month: 12, recurring: 0, single: 10_000 }];
    const normal = buildAmortization(200_000, 6, 30, 0);
    const withSingle = buildAmortization(200_000, 6, 30, 0, entries);
    expect(withSingle[10].remainingBalance).toBeCloseTo(normal[10].remainingBalance, 1);
    expect(withSingle[12].remainingBalance).toBeLessThan(normal[12].remainingBalance - 9_000);
    expect(withSingle.length).toBeLessThan(normal.length);
  });

  it("combined recurring (expanded) + single entry", () => {
    const entries: ExtraPaymentEntry[] = [
      ...recurringRange(1, 360, 100),
      { month: 24, recurring: 100, single: 5000 },
    ];
    const normal = buildAmortization(200_000, 6, 30, 0);
    const withBoth = buildAmortization(200_000, 6, 30, 0, entries);
    expect(withBoth.length).toBeLessThan(normal.length);
    const normalInterest = normal[normal.length - 1].cumulativeInterest;
    const bothInterest = withBoth[withBoth.length - 1].cumulativeInterest;
    expect(bothInterest).toBeLessThan(normalInterest);
  });

  it("expanded recurring that stops mid-loan pays off slower than one that continues", () => {
    // $100 for months 1..120 then nothing vs. $100 for months 1..360
    const partial = recurringRange(1, 120, 100);
    const full = recurringRange(1, 360, 100);
    const withPartial = buildAmortization(200_000, 6, 30, 0, partial);
    const withFull = buildAmortization(200_000, 6, 30, 0, full);
    expect(withPartial.length).toBeGreaterThan(withFull.length);
  });

  it("Cory regression: sparse legacy entries (months 1..120 at $500) do NOT silently continue past month 120", () => {
    // Under the broken carry-forward model, this would pay off a 30-year loan
    // in ~15 years. Under per-month semantics, the extras stop at month 120.
    const entries = recurringRange(1, 120, 500);
    const result = buildAmortization(200_000, 6, 30, 0, entries);
    // Sanity: there should still be a meaningful tail of payments after month 120.
    expect(result.length).toBeGreaterThan(200);
    // And the balance at month 120 should be well above zero (not "1 payment left").
    const atM120 = result.find((r) => r.month === 120);
    expect(atM120).toBeDefined();
    expect(atM120!.remainingBalance).toBeGreaterThan(50_000);
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
    // $200 recurring expanded across the full term matches the flat-extra case.
    const entries: ExtraPaymentEntry[] = recurringRange(1, 360, 200);
    const result = compareWithAndWithoutExtra(200_000, 6, 30, 0, entries);
    expect(result.monthsSaved).toBeGreaterThan(50);
    expect(result.interestSaved).toBeGreaterThan(50_000);
  });
});
