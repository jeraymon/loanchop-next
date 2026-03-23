import type { Metadata } from "next";

import { Calculator } from "./Calculator";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MathSolver",
  name: "Density Equation Calculator",
  url: "https://www.ajdesigner.com/density",
  description:
    "Calculate density, mass, or volume using the density equation ρ = m / V. Supports unit conversions.",
  inLanguage: "en",
  potentialAction: [
    {
      "@type": "SolveMathAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.ajdesigner.com/density?solveFor={solveFor}&mass={mass}&volume={volume}&density={density}",
        "query-input": [
          "required name=solveFor",
          "required name=mass",
          "required name=volume",
          "required name=density",
        ],
      },
      eduQuestionType: "Physics",
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
    title: "Density Equation Calculator — Solve for Density, Mass, or Volume",
    description:
      "Use our Density Equation Calculator to solve for density, mass, or volume. Supports unit conversions with high-precision BigNumber math.",
    alternates: { canonical: "/density" },
    openGraph: {
      title: "Density Equation Calculator — Solve for Density, Mass, or Volume",
      description:
        "Calculate density, mass, or volume using ρ = m / V. Free online calculator with unit conversions and high-precision math.",
      url: "https://www.ajdesigner.com/density",
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
      name: "How do you calculate density from mass and volume?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Divide the mass by the volume: ρ = m / V. For example, a 500 g object that occupies 200 cm³ has a density of 500 / 200 = 2.5 g/cm³.",
      },
    },
    {
      "@type": "Question",
      name: "What is the density of water?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pure water at 4 °C has a density of 1,000 kg/m³ (1 g/cm³). This value decreases slightly as temperature rises or falls from 4 °C.",
      },
    },
    {
      "@type": "Question",
      name: "Does an object float if its density is less than water?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. An object floats in a fluid when it is less dense than that fluid. Wood (~600 kg/m³) floats on water, while iron (~7,870 kg/m³) sinks.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between density and specific gravity?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Density has units (kg/m³), while specific gravity is a dimensionless ratio of a substance's density to the density of a reference (usually water). A specific gravity of 2.7 means the substance is 2.7 times denser than water.",
      },
    },
  ],
};

export default function DensityPage() {
  return (
    <>
      <script
        id="density-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id="density-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Calculator/>
    </>
  );
}
