import type { EducationalContent } from "@/types/educational";

export const educationalContent: EducationalContent = {
  equationCards: [
    {
      title: "Monthly Payment Formula",
      formula: "M = P × [r(1+r)^n] / [(1+r)^n − 1]",
      description:
        "This standard amortization formula calculates the fixed monthly payment for a loan using the principal P, monthly interest rate r, and total number of payments n. It is the starting point for both the normal and accelerated payoff schedules.",
      solveFor: "default",
      buttonLabel: "Calculate Payment",
    },
  ],

  howItWorks:
    "Loan prepayment works by pushing additional dollars directly toward principal instead of waiting for the standard amortization schedule to do the job gradually. Because interest is charged on the remaining balance each month, every extra principal payment lowers future interest charges as well. That means prepaying creates a compounding benefit: you save interest now, which helps later payments attack principal faster, which saves even more interest later. This calculator compares the normal schedule against an accelerated one so you can see monthly payment, total interest, time saved, and the changing balance path side by side.",

  exampleProblem: {
    setup:
      "Suppose you have a $250,000 loan at 6.5% for 30 years and you want to add $300 per month in extra principal payments.",
    steps: [
      "Calculate the required monthly payment from the original principal, rate, and term.",
      "Build the normal amortization schedule with no extra principal.",
      "Build a second schedule that adds $300 to principal every month.",
      "Compare how quickly the accelerated balance falls versus the normal balance.",
      "Total the interest paid in each schedule to measure the savings from prepayment.",
      "Compare the payoff lengths to find how many months or years earlier the accelerated plan finishes.",
    ],
    note:
      "This is why a relatively small recurring extra payment can produce large lifetime savings on long mortgages and installment loans.",
  },

  keyConcepts:
    "Extra payments do not usually lower the required monthly payment on a fixed-rate loan; instead, they shorten the schedule and reduce total interest. A recurring extra payment is useful when you can commit to a steady amount each month, while a one-time lump sum models bonuses, tax refunds, or windfalls. Prepayment is mathematically similar to earning a guaranteed return equal to your loan's interest rate, but the best choice still depends on emergency savings, other debts, and investment opportunities.",

  applications: [
    "Testing whether small extra monthly payments meaningfully reduce mortgage interest",
    "Planning a payoff strategy before retirement or another major life milestone",
    "Modeling bonus or tax-refund lump sums as principal prepayments",
    "Comparing a standard schedule against an accelerated schedule before making a refinance decision",
    "Seeing how much faster a 15-year or 30-year loan ends with extra payments",
    "Understanding how earlier principal reduction changes later interest charges",
  ],

  commonMistakes: [
    "Assuming extra payments reduce the required monthly payment instead of shortening the payoff timeline",
    "Forgetting to confirm that the lender applies extra money to principal rather than future scheduled payments",
    "Ignoring prepayment penalties or loan-servicing rules that may apply in the first years of some loans",
    "Comparing mortgage prepayment with investing without accounting for risk, liquidity, and emergency-fund needs",
    "Treating one unusually high-payment month as a realistic long-term prepayment plan",
    "Looking only at interest saved without considering how the faster cash commitment fits the monthly budget",
  ],

  faq: [
    {
      question: "Does an extra payment go straight to principal?",
      answer:
        "Usually yes, but you should confirm with your loan servicer. Many lenders provide an 'additional principal' field for this reason. If the extra amount is not applied to principal, the savings will be much smaller than expected.",
    },
    {
      question: "Do extra payments lower my monthly payment?",
      answer:
        "No. On a typical fixed-rate loan, the required monthly payment stays the same. The benefit is that the balance falls faster, total interest decreases, and the loan ends earlier.",
    },
    {
      question: "Is it better to make one lump-sum payment or smaller monthly extra payments?",
      answer:
        "Both help, but earlier principal reduction usually saves more interest. A lump sum applied early can have a powerful effect, while recurring monthly extras create a steady compounding benefit over time.",
    },
    {
      question: "Should I prepay my mortgage or invest instead?",
      answer:
        "Prepaying gives you a guaranteed return equal to your loan rate, while investing may offer a higher expected return but with market risk. The right choice depends on your risk tolerance, cash reserves, and other financial goals.",
    },
    {
      question: "Can extra payments save years on a 30-year mortgage?",
      answer:
        "Yes. Even modest recurring extra payments can cut years off a long amortization schedule because they reduce principal early, which lowers future interest charges month after month.",
    },
    {
      question: "Does this calculator include taxes, insurance, or escrow?",
      answer:
        "No. It focuses on loan principal and interest only. Property taxes, homeowners insurance, HOA dues, and escrow are separate cash-flow items and are not part of the amortization math shown here.",
    },
    {
      question: "What if I make irregular extra payments instead of the same amount every month?",
      answer:
        "That is exactly why the schedule supports per-row extra payments. You can model one-time lump sums or changes that begin in a specific month and continue afterward.",
    },
    {
      question: "Why do earlier extra payments matter more than later ones?",
      answer:
        "Interest charges are larger in the early years because the balance is larger. Reducing principal early lowers a bigger stream of future interest than making the same extra payment near the end of the loan.",
    },
  ],

  reference:
    "Principal-and-interest comparison only. This calculator does not include taxes, insurance, escrow, fees, or financial advice.",
};
