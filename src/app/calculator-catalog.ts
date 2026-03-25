// ---------------------------------------------------------------------------
// Calculator catalog — single source of truth for the index page & sidebar
// ---------------------------------------------------------------------------

export type Calculator = {
  name: string;
  href: string;
  live: boolean;
};

export type Category = {
  id: string;
  label: string;
  calculators: Calculator[];
};

// Helpers
const live = (name: string, href: string): Calculator => ({ name, href, live: true });

export const categories: Category[] = [
  {
    id: "loan",
    label: "Loan Calculators",
    calculators: [
      live("Loan Prepayment Calculator", "/"),
    ],
  },
];

/** Total calculator count */
export const totalCalculators = categories.reduce((sum, c) => sum + c.calculators.length, 0);
