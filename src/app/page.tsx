import type { Metadata } from "next";
import Calculator from "./Calculator";
import { educationalContent } from "./educationalContent";
import { SITE_NAME, SITE_URL, OG_IMAGE, buildOrganizationFounder } from "./seo-constants";

const pageTitle = "Loan Prepayment Calculator — Extra Payment Savings";
const pageDescription =
  "See how extra monthly payments reduce total interest and shorten your loan term. Compare normal vs. accelerated payoff with an interactive amortization schedule.";
const canonicalUrl = SITE_URL;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
    icons: { icon: "/favicon.svg", apple: "/apple-icon.png" },
    description: pageDescription,
    keywords: ["loan prepayment", "extra payment calculator", "mortgage payoff", "loan payoff", "amortization", "interest savings", "early payoff"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: educationalContent.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: "https://www.loanchop.com/images/logo.png",
  },
  email: "aj@ajdesigner.com",
  parentOrganization: {
    "@type": "Organization",
    name: "AJ Design Software",
    url: "https://www.ajdesigner.com",
  },
  founder: buildOrganizationFounder({ siteUrl: SITE_URL }),
  sameAs: [
    "https://www.ajdesigner.com",
    "https://www.cameradof.com",
    "https://www.dollarsperhour.com",
    "https://www.hourlysalaries.com",
    "https://www.bogodiscount.com",
    "https://www.compare2loans.com",
    "https://www.percentoffcalculator.com",
    "https://www.percenterrorcalculator.com",
    "https://www.infantchart.com",
    "https://www.medicalequations.com",
    "https://www.optionsmath.com",
    "https://www.rncalc.com",
    "https://www.temperaturetool.com",
    "https://www.zscorecalculator.com",
  ],
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "LoanChop",
      item: canonicalUrl,
    },
  ],
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Calculate Loan Prepayment Savings",
  description: pageDescription,
  author: { "@id": "https://www.ajdesigner.com/about/#jimmy" },
  dateModified: "2026-05-10",
  step: educationalContent.exampleProblem.steps.map((text, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text,
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <Calculator />
    </>
  );
}
