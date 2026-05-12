import type { RelatedLink } from "./RelatedCalculatorsCard";
import RelatedCalculatorsCard from "./RelatedCalculatorsCard";

/**
 * Sister-site cross-link card. Same visual shape as RelatedCalculatorsCard
 * but defaults to the "Related Sites" heading. Per network convention this
 * card lists 6 sister properties with light per-page rotation so the
 * outbound link neighborhood isn't identical boilerplate across every calc.
 *
 * All sister-site URLs are external by definition; the inner component
 * auto-detects http(s) hrefs and adds target="_blank" + rel.
 */
export default function RelatedSitesCard({
  title = "Related Sites",
  links,
}: {
  title?: string;
  links: readonly RelatedLink[];
}) {
  return <RelatedCalculatorsCard title={title} links={links} />;
}

/**
 * Network-wide sister-site catalog. Per-calc lists pick a rotation from
 * here. LoanChop (the current site) is intentionally excluded — these
 * are the 14 other sister properties.
 */
export const sisterSites: Record<string, RelatedLink> = {
  ajdesigner: {
    href: "https://www.ajdesigner.com",
    label: "AJ Designer",
    description: "200+ engineering and science calculators",
  },
  bogoDiscount: {
    href: "https://www.bogodiscount.com",
    label: "BOGO Discount",
    description: "Buy-one-get-one discount calculator",
  },
  cameraDof: {
    href: "https://www.cameradof.com",
    label: "CameraDOF",
    description: "Depth of field calculator for photographers",
  },
  compareLoans: {
    href: "https://www.compare2loans.com",
    label: "Compare 2 Loans",
    description: "Side-by-side loan comparison calculator",
  },
  dollarsPerHour: {
    href: "https://www.dollarsperhour.com",
    label: "Dollars Per Hour",
    description: "Weekly paycheck calculator with overtime",
  },
  hourlySalaries: {
    href: "https://www.hourlysalaries.com",
    label: "Hourly Salaries",
    description: "Hourly wage to annual salary converter",
  },
  infantChart: {
    href: "https://www.infantchart.com",
    label: "InfantChart",
    description: "Baby and child growth percentile charts",
  },
  medicalEquations: {
    href: "https://www.medicalequations.com",
    label: "Medical Equations",
    description: "Hemodynamic, pulmonary, and dosing calculators",
  },
  optionsMath: {
    href: "https://www.optionsmath.com",
    label: "OptionsMath",
    description: "Options trading profit and loss calculators",
  },
  percentError: {
    href: "https://www.percenterrorcalculator.com",
    label: "Percent Error Calculator",
    description: "Calculate percent error between experimental and theoretical values",
  },
  percentOff: {
    href: "https://www.percentoffcalculator.com",
    label: "Percent Off Calculator",
    description: "Discount and sale price calculator",
  },
  rnCalc: {
    href: "https://www.rncalc.com",
    label: "RN Calc",
    description: "Nursing dosage and calculation tools",
  },
  temperatureTool: {
    href: "https://www.temperaturetool.com",
    label: "Temperature Tool",
    description: "Temperature unit converter",
  },
  zscoreCalculator: {
    href: "https://www.zscorecalculator.com",
    label: "Z-Score Calculator",
    description: "Z-score, percentile, and probability calculator",
  },
};
