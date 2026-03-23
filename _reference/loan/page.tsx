import type { Metadata } from "next";

import { Calculator } from "./Calculator";

const jsonLd = {
  "@context": "https://schema.org", "@type": "MathSolver",
  name: "Loan Calculator", url: "https://www.ajdesigner.com/loan",
  description: "Calculate monthly payment, loan amount, or loan term using the standard amortization formula.",
  inLanguage: "en",
  potentialAction: [{ "@type": "SolveMathAction", target: { "@type": "EntryPoint", urlTemplate: "https://www.ajdesigner.com/loan?solveFor={solveFor}", "query-input": ["required name=solveFor"] }, eduQuestionType: "Finance" }],
  publisher: { "@type": "Organization", name: "AJ Designer", logo: { "@type": "ImageObject", url: "https://www.ajdesigner.com/images/aj_01.jpg" } },
};

export function generateMetadata(): Metadata {
  return {
    title: "Loan Calculator — Monthly Payment, Amount & Term",
    description: "Calculate monthly payment, loan amount, or loan term using the amortization formula. Shows total interest paid. Free online calculator.",
    alternates: { canonical: "/loan" },
    openGraph: {
      title: "Loan Calculator", description: "Solve loan amortization problems. Free calculator with total interest breakdown.",
      url: "https://www.ajdesigner.com/loan", siteName: "AJ Designer", type: "website",
      images: [{ url: "https://www.ajdesigner.com/images/og-default.jpg", width: 1200, height: 630, alt: "AJ Designer Engineering Calculators" }],
    },
  };
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How is a loan payment calculated?", acceptedAnswer: { "@type": "Answer", text: "Using the amortization formula M = P x r(1+r)^n / [(1+r)^n - 1]. For a $100,000 loan at 5% for 30 years, the monthly payment is $536.82." } },
    { "@type": "Question", name: "How much interest do you pay over the life of a loan?", acceptedAnswer: { "@type": "Answer", text: "Multiply monthly payment by total payments, subtract principal. A $300,000 mortgage at 7% for 30 years costs about $418,527 in total interest." } },
    { "@type": "Question", name: "Does extra payment reduce total interest?", acceptedAnswer: { "@type": "Answer", text: "Yes. Adding $100/month to a $250,000 mortgage at 6% saves about $45,000 in interest and pays off 5 years early." } },
  ],
};

export default function LoanPage() {
  return (
    <>
      <script id="loan-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
      <script id="loan-faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}/>
      <Calculator/>
    </>
  );
}
