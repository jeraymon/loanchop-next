// Shared types for educational content — pure data, no React/JSX.
// Each calculator exports an EducationalContent object from educationalContent.ts.

export interface EquationCard {
  /** Section heading, e.g. "Newton's Second Law of Motion" */
  title: string;
  /** Plain-text formula, e.g. "F = m × a" */
  formula: string;
  /** 2-3 sentence description of the equation */
  description: string;
  /** Solve-for key to pre-set when user clicks the scroll button */
  solveFor: string;
  /** For multi-equation calculators: the equation type key */
  equationType?: string;
  /** Button label, e.g. "Calculate Force" */
  buttonLabel: string;
}

export interface FaqItem {
  question: string;
  /** Plain text answer — use unicode chars, not HTML entities */
  answer: string;
}

export interface WhenToUse {
  solveFor: string;
  /** Display label, e.g. "Solve for Force" */
  label: string;
  /** Description, e.g. "when you know mass and acceleration..." */
  text: string;
}

export interface EducationalContent {
  equationCards: EquationCard[];
  /** "How It Works" paragraph(s) */
  howItWorks: string;
  exampleProblem: {
    /** Problem description */
    setup: string;
    /** Ordered solution steps */
    steps: string[];
    /** Optional extra note */
    note?: string;
  };
  /** Optional — for multi-solve calcs */
  whenToUse?: WhenToUse[];
  /** Optional paragraph(s) — e.g. "Density vs. Concentration" */
  keyConcepts?: string;
  /** Optional bulleted list of real-world applications */
  applications?: string[];
  /** Optional bulleted list of common mistakes */
  commonMistakes?: string[];
  faq: FaqItem[];
  /** Optional reference citation */
  reference?: string;
}
