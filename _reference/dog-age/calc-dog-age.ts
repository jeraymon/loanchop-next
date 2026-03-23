/**
 * Three-phase piecewise aging model:
 *   0–1 yr:  linear × firstYearAging (default 15)
 *   1–2 yr:  +secondYearAging (default 9)
 *   2+  yr:  linear rate so breed life expectancy maps to human life expectancy
 */
export function calcDogAge(
  calendarAge: number,
  breedLifeExpectancy: number,
  firstYearAging = 15,
  secondYearAging = 9,
  humanLifeExpectancy = 68,
): number {
  if (calendarAge <= 0) return 0;
  if (calendarAge <= 1) {
    return calendarAge * firstYearAging;
  }
  if (calendarAge <= 2) {
    return firstYearAging + (calendarAge - 1) * secondYearAging;
  }
  const ratePerYear =
    (humanLifeExpectancy - firstYearAging - secondYearAging) /
    (breedLifeExpectancy - 2);
  return firstYearAging + secondYearAging + ratePerYear * (calendarAge - 2);
}
