import type { Metadata } from "next";

import { Calculator } from "./Calculator";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MathSolver",
  name: "Force Equation Calculator",
  url: "https://www.ajdesigner.com/force",
  description:
    "Calculate force, mass, or acceleration using Newton's second law F = m × a. Supports unit conversions.",
  inLanguage: "en",
  potentialAction: [
    {
      "@type": "SolveMathAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://www.ajdesigner.com/force?solveFor={solveFor}&force={force}&mass={mass}&acceleration={acceleration}",
        "query-input": [
          "required name=solveFor",
          "required name=force",
          "required name=mass",
          "required name=acceleration",
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
    title: "Force Equation Calculator — Solve for Force, Mass, or Acceleration",
    description:
      "Use our Force Equation Calculator to solve for force, mass, or acceleration using F = m × a. Supports unit conversions with high-precision math.",
    alternates: { canonical: "/force" },
    openGraph: {
      title: "Force Equation Calculator — Solve for Force, Mass, or Acceleration",
      description:
        "Calculate force, mass, or acceleration using Newton's second law F = m × a. Free online calculator with unit conversions.",
      url: "https://www.ajdesigner.com/force",
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
      name: "What is the force equation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The force equation is F = m × a, also known as Newton's second law. It states that force equals an object's mass multiplied by its acceleration. For example, pushing a 10 kg cart with an acceleration of 2 m/s² requires 20 N of force.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between mass and weight?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mass measures the amount of matter in an object (in kilograms) and stays the same everywhere. Weight is the gravitational force acting on that mass (in newtons) and changes depending on where you are. On the Moon, your weight is about one-sixth of what it is on Earth, but your mass is unchanged.",
      },
    },
    {
      "@type": "Question",
      name: "How does increasing mass affect acceleration?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If the applied force stays the same, increasing the mass decreases the acceleration. This follows directly from a = F / m. Doubling the mass cuts the acceleration in half.",
      },
    },
    {
      "@type": "Question",
      name: "Can you use the force equation for objects moving in a circle?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. For circular motion the centripetal force keeps the object on its curved path. You still apply F = m × a, where the acceleration is the centripetal acceleration directed toward the center of the circle.",
      },
    },
    {
      "@type": "Question",
      name: "What are common mistakes when using F = ma?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most common errors are confusing mass with weight, using inconsistent units (e.g., grams instead of kilograms), and forgetting that force and acceleration are vectors with direction. Always convert to consistent units before calculating.",
      },
    },
  ],
};

export default function ForcePage() {
  return (
    <>
      <script
        id="force-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        id="force-faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Calculator/>
    </>
  );
}
