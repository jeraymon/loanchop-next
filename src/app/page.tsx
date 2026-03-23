import { Metadata } from "next";
import { CalculatorDirectory } from "./CalculatorDirectory";

export const metadata: Metadata = {
  title: "AJ Designer | Engineering & Science Calculators",
  description:
    "200+ free online calculators for physics, engineering, math, fluid mechanics, and finance. High-precision results with unit conversions.",
  openGraph: {
    title: "AJ Designer — Engineering & Science Calculators",
    description:
      "Professional calculators for density, force, friction, ideal gas law, and more. Free, accessible, high-precision.",
    url: "https://www.ajdesigner.com",
    siteName: "AJ Designer",
    type: "website",
    images: [{ url: "https://www.ajdesigner.com/images/og-default.jpg", width: 1200, height: 630, alt: "AJ Designer Engineering Calculators" }],
  },
};

export default function HomePage() {
  return <CalculatorDirectory />;
}
