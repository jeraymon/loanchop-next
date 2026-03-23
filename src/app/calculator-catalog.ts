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
const soon = (name: string): Calculator => ({ name, href: "#", live: false });

export const categories: Category[] = [
  // Add your categories here, e.g.:
  // {
  //   id: "physics",
  //   label: "Physics",
  //   calculators: [
  //     live("Force Equation Calculator", "/force"),
  //     soon("Gravity Calculator"),
  //   ],
  // },
];

/** Total calculator count */
export const totalCalculators = categories.reduce((sum, c) => sum + c.calculators.length, 0);
