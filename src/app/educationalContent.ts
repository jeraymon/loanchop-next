import type { EducationalContent } from "@/types/educational";

export const educationalContent: EducationalContent = {
  equationCards: [
    {
      title: "Monthly Payment Formula",
      formula: "M = P \u00d7 [r(1+r)^n] / [(1+r)^n \u2212 1]",
      description:
        "The standard amortization formula calculates the fixed monthly payment for a loan given the principal, monthly interest rate, and total number of payments. This is the foundation of every mortgage payment schedule.",
      solveFor: "default",
      buttonLabel: "Calculate Payment",
    },
  ],

  howItWorks:
    "When you make extra payments on your loan, the additional amount goes directly toward reducing your principal balance. Since interest is calculated on the remaining balance each month, a lower balance means less interest accrues. This creates a compounding effect: each extra dollar paid today saves you multiple dollars in future interest. Even modest additional payments of $50 to $200 per month can shave years off a 30-year mortgage and save tens of thousands in interest.",

  exampleProblem: {
    setup:
      "Consider a $250,000 mortgage at 6.5% annual interest for 30 years. The standard monthly payment is $1,580.17. Over the full term you would pay $318,861 in interest alone.",
    steps: [
      "Standard monthly payment: $1,580.17 for 360 months",
      "Total interest without extra payments: $318,861",
      "Add $300/month in extra payments toward principal",
      "New payoff time: approximately 21 years (252 months) instead of 30",
      "Total interest with extra payments: approximately $198,000",
      "Interest saved: approximately $120,000",
    ],
    note:
      "That $300 monthly investment effectively earns a guaranteed return equivalent to your mortgage rate, which is difficult to match with other low-risk investments.",
  },

  keyConcepts:
    "Most lenders allow prepayment without penalties, though it is worth confirming with your loan servicer. Some loans have prepayment penalty clauses, particularly during the first few years. Federal law prohibits prepayment penalties on many types of mortgages originated after January 2014. This calculator supports two types of extra payments: repeating payments that apply from a selected month onward, and single lump-sum payments for one specific month.",

  applications: [
    "Determining how much interest you save by adding a fixed extra monthly payment to your mortgage",
    "Modeling a lump-sum principal payment from a bonus, tax refund, or inheritance",
    "Comparing the payoff timeline with and without extra payments side by side",
    "Planning a strategy to become mortgage-free before retirement",
    "Evaluating whether extra payments or investing offers a better return given your interest rate",
  ],

  commonMistakes: [
    "Assuming extra payments reduce your required monthly payment (they shorten the term instead)",
    "Not confirming with your lender that extra payments are applied to principal rather than held for future payments",
    "Ignoring prepayment penalty clauses that some loans carry in the first few years",
    "Comparing a guaranteed mortgage paydown return to risky investment returns without accounting for risk tolerance",
  ],

  faq: [
    {
      question: "Should I make extra payments or invest the money instead?",
      answer:
        "Paying down your mortgage offers a guaranteed, risk-free return equal to your interest rate. If your mortgage rate is 6% or higher, extra payments are often a strong choice. If your rate is below 4%, you might earn more by investing in diversified index funds over the long term, though that carries market risk. Consider your risk tolerance, tax situation, and whether you have an adequate emergency fund before deciding.",
    },
    {
      question:
        "Is it better to pay extra monthly or make a lump sum payment?",
      answer:
        "Both approaches reduce your principal and save interest. A lump sum applied early in the loan has the largest impact because it reduces the balance when interest charges are highest. Monthly extra payments provide a disciplined, consistent approach that is easier to budget for. Mathematically, the earlier you apply the money, the more you save.",
    },
    {
      question: "Do extra payments reduce my monthly payment amount?",
      answer:
        "No. Extra payments reduce your remaining balance and shorten the loan term, but your required monthly payment stays the same. The benefit is that you pay off the loan sooner and pay significantly less total interest. If you need a lower monthly payment, you would need to refinance your loan.",
    },
    {
      question:
        "How do I tell my lender to apply extra payments to principal?",
      answer:
        "Most lenders apply extra payments to principal automatically, but it is wise to confirm. When making your payment, look for an \"additional principal\" field on your statement or online portal. You can also include a note with your payment specifying that the extra amount should be applied to principal, not held for future payments.",
    },
  ],
};
