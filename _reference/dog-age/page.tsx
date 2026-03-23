import type { Metadata } from "next";

import { Calculator } from "./Calculator";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MathSolver",
  name: "Dog Age Calculator",
  url: "https://www.ajdesigner.com/dog-age",
  description:
    "Convert your dog's calendar age to human-equivalent years using breed-specific lifespan data for 170+ breeds. Interactive aging chart included.",
  inLanguage: "en",
  potentialAction: [
    {
      "@type": "SolveMathAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.ajdesigner.com/dog-age?breed={breed}&years={years}&months={months}",
        "query-input": [
          "required name=breed",
          "required name=years",
          "required name=months",
        ],
      },
      eduQuestionType: "Biology",
    },
  ],
  publisher: {
    "@type": "Organization",
    name: "AJ Designer",
    logo: {
      "@type": "ImageObject",
      url: "https://www.ajdesigner.com/images/aj_01.jpg",
    },
  },
};

export function generateMetadata(): Metadata {
  return {
    title: "Dog Age Calculator — Convert Dog Years to Human Years by Breed",
    description:
      "Calculate your dog's age in human years using breed-specific lifespan data for 170+ breeds. Three-phase aging model with interactive chart.",
    alternates: { canonical: "/dog-age" },
    openGraph: {
      title: "Dog Age Calculator — Convert Dog Years to Human Years by Breed",
      description:
        "Convert dog years to human years with breed-specific data for 170+ breeds. Interactive aging chart and age conversion table.",
      url: "https://www.ajdesigner.com/dog-age",
      siteName: "AJ Designer",
      type: "website",
      images: [{ url: "https://www.ajdesigner.com/images/og-default.jpg", width: 1200, height: 630, alt: "AJ Designer Engineering Calculators" }],
    },
  };
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the multiply by 7 rule accurate for dogs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. A 1-year-old dog is closer to 15 in human years, not 7. The \"times 7\" rule ignores the rapid maturation in the first two years and the large variation between breeds.",
      },
    },
    {
      "@type": "Question",
      name: "Why do small dogs live longer than large dogs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Researchers believe larger dogs age faster at the cellular level. A Great Dane (6-8 year lifespan) ages roughly twice as fast per year as a Chihuahua (10-18 years) after age 2. The exact biological mechanisms are still being studied.",
      },
    },
    {
      "@type": "Question",
      name: "At what age is a dog considered senior?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on breed size. Small dogs are considered senior around 10-12 years, medium dogs around 8-10, and large or giant breeds as early as 5-6 years. Senior dogs benefit from twice-yearly vet visits.",
      },
    },
    {
      "@type": "Question",
      name: "How old is a 10 year old dog in human years?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It varies by breed. A 10-year-old Beagle (avg lifespan 13.5 years) is about 57 human years, while a 10-year-old Great Dane (avg lifespan 7 years) would be roughly 78 human years.",
      },
    },
  ],
};

export default function DogAgePage() {
  return (
    <>
      <script
        id="dog-age-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id="dog-age-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Calculator/>
    </>
  );
}
