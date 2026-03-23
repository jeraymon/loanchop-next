import type { Metadata } from "next";
import { Calculator } from "./Calculator";

export function generateMetadata(): Metadata {
  return {
    title: "Length Unit Converter — Convert Meters, Feet, Inches & More",
    description:
      "Free online length converter. Convert between meters, feet, inches, miles, kilometers, centimeters, millimeters, yards, and more.",
    alternates: { canonical: "/length-converter" },
    openGraph: {
      title: "Length Unit Converter — Convert Meters, Feet, Inches & More",
      description:
        "Convert between meters, feet, inches, miles, kilometers, and more length units instantly.",
      url: "https://www.ajdesigner.com/length-converter",
      siteName: "AJ Designer",
      type: "website",
      images: [
        {
          url: "https://www.ajdesigner.com/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: "AJ Designer Engineering Calculators",
        },
      ],
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MathSolver",
  name: "Length Unit Converter",
  url: "https://www.ajdesigner.com/length-converter",
  description:
    "Convert between meters, feet, inches, miles, kilometers, centimeters, and more length units.",
  inLanguage: "en",
  potentialAction: [
    {
      "@type": "SolveMathAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.ajdesigner.com/length-converter",
      },
      eduQuestionType: "Unit Conversion",
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How many feet are in a meter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One meter equals approximately 3.28084 feet. The meter is defined as the distance light travels in a vacuum in 1/299,792,458 of a second, while the foot is defined as exactly 0.3048 meters.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between a mile and a kilometer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "One mile equals exactly 1.609344 kilometers. Miles are used in the United States and United Kingdom for road distances, while kilometers are used in most other countries and in scientific work.",
      },
    },
    {
      "@type": "Question",
      name: "How do I convert inches to centimeters?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Multiply the number of inches by 2.54. This factor is exact by definition — one inch is defined as precisely 25.4 millimeters (2.54 centimeters).",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        id="length-converter-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id="length-converter-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Calculator />
    </>
  );
}
