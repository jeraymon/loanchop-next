import type { Metadata } from "next";
import Calculator from "./Calculator";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Loan Prepayment Calculator — See How Extra Payments Save You Money | LoanChop",
    icons: { icon: "/favicon.svg", apple: "/apple-icon.png" },
    description:
      "Free loan prepayment calculator. See how extra monthly payments reduce total interest and shorten your mortgage. Interactive amortization schedule and balance chart.",
    alternates: {
      canonical: "https://www.loanchop.com/",
    },
    openGraph: {
      title: "Loan Prepayment Calculator — LoanChop",
      description:
        "See how extra monthly payments reduce total interest and shorten your mortgage. Free interactive amortization schedule.",
      url: "https://www.loanchop.com/",
      siteName: "LoanChop",
      type: "website",
      images: [
        {
          url: "https://www.loanchop.com/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: "LoanChop Loan Prepayment Calculator",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Loan Prepayment Calculator — LoanChop",
      description:
        "See how extra monthly payments reduce total interest and shorten your mortgage.",
    },
  };
}

const mathSolverJsonLd = {
  "@context": "https://schema.org",
  "@type": "MathSolver",
  name: "Loan Prepayment Calculator",
  description:
    "Calculate how extra monthly payments reduce total interest and shorten your loan term. Includes interactive amortization schedule and balance comparison chart.",
  inLanguage: "en",
  url: "https://www.loanchop.com/",
  publisher: {
    "@type": "Organization",
    name: "LoanChop",
    url: "https://www.loanchop.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.loanchop.com/images/og-default.jpg",
    },
  },
  potentialAction: {
    "@type": "SolveMathAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.loanchop.com/?principal={principal}&rate={rate}&years={years}&extra={extra}",
      "query-input": "required name=principal name=rate name=years name=extra",
    },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Should I make extra payments or invest the money instead?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Paying down your mortgage offers a guaranteed, risk-free return equal to your interest rate. If your mortgage rate is 6% or higher, extra payments are often a strong choice. If your rate is below 4%, you might earn more by investing in diversified index funds over the long term, though that carries market risk. Consider your risk tolerance, tax situation, and whether you have an adequate emergency fund before deciding.",
      },
    },
    {
      "@type": "Question",
      name: "Is it better to pay extra monthly or make a lump sum payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both approaches reduce your principal and save interest. A lump sum applied early in the loan has the largest impact because it reduces the balance when interest charges are highest. Monthly extra payments provide a disciplined, consistent approach that is easier to budget for. Mathematically, the earlier you apply the money, the more you save.",
      },
    },
    {
      "@type": "Question",
      name: "Do extra payments reduce my monthly payment amount?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Extra payments reduce your remaining balance and shorten the loan term, but your required monthly payment stays the same. The benefit is that you pay off the loan sooner and pay significantly less total interest. If you need a lower monthly payment, you would need to refinance your loan.",
      },
    },
    {
      "@type": "Question",
      name: "How do I tell my lender to apply extra payments to principal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most lenders apply extra payments to principal automatically, but it is wise to confirm. When making your payment, look for an 'additional principal' field on your statement or online portal. You can also include a note with your payment specifying that the extra amount should be applied to principal, not held for future payments.",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mathSolverJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Calculator />
    </>
  );
}
