import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE_NAME, SITE_URL, buildPersonJsonLd } from "../seo-constants";

const pageTitle = "About LoanChop — Loan Prepayment Calculator";
const pageDescription =
  "LoanChop is a free loan prepayment calculator showing how extra payments cut interest. Verified amortization math and the engineer behind it.";
const canonicalUrl = `${SITE_URL}/about/`;
const pageCreatedDate = "2026-05-10T00:00:00Z";
const pageModifiedDate = "2026-05-10T00:00:00Z";
const personDescription =
  "Jimmy Raymond is the engineer behind LoanChop, with backgrounds in environmental engineering, computer science, and safety-critical software systems.";
const OG_IMAGE = {
  url: `${SITE_URL}/images/og-default.jpg`,
  width: 1200,
  height: 630,
  alt: `${pageTitle} — ${SITE_NAME}`,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      "about loanchop",
      "jimmy raymond engineer",
      "loan prepayment calculator",
      "mortgage payoff calculator",
      "amortization math",
      "about the author",
    ],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "profile",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

const personJsonLd = buildPersonJsonLd({
  siteUrl: SITE_URL,
  description: personDescription,
  knowsAbout: [
    "Loan amortization",
    "Mortgage prepayment math",
    "Personal finance",
    "Software engineering",
    "Safety-critical software",
  ],
});

const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": `${canonicalUrl}#profilepage`,
  url: canonicalUrl,
  name: pageTitle,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "About", item: canonicalUrl },
    ],
  },
  mainEntity: personJsonLd,
  dateCreated: pageCreatedDate,
  dateModified: pageModifiedDate,
};

export default function AboutPage() {
  return (
    <>
      <script
        id="about-profilepage-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <div className="not-prose mb-4">
          <Breadcrumbs breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about/" },
          ]} />
        </div>
        <h1>About LoanChop</h1>
        <p>
          LoanChop is a free loan prepayment calculator that shows how extra
          principal payments shorten the life of a loan and cut total interest
          cost. No signups, no paywalls, no data collection — just an
          amortization schedule, a side-by-side comparison of normal vs.
          accelerated payoff, and the math you need to make a confident
          decision.
        </p>

        <h2>A brief history</h2>
        <p>
          LoanChop started as a small side project to answer a question I kept
          getting asked: &ldquo;If I throw an extra hundred dollars at my
          mortgage every month, how much does that actually save me?&rdquo; The
          arithmetic isn&apos;t hard, but it&apos;s tedious to do by hand, and
          most online calculators either hide the schedule, gate it behind a
          signup, or quietly upsell a refinance product. I wanted a clean,
          honest tool that just answered the question.
        </p>
        <p>
          The first version was a spreadsheet. It became a small PHP page, then
          a standalone site, and in 2026 I rebuilt it on a modern static stack
          (Next.js) for better speed and accessibility. Each rewrite tightened
          the math, expanded the schedule view, and added a balance chart so
          you can see the two payoff curves diverge.
        </p>

        <h2>How the math is verified</h2>
        <p>
          The calculator uses standard amortization formulas — the same
          monthly-payment and remaining-balance equations that banks use
          internally. Each result is cross-checked against published bank
          amortization tables and against independently-built reference
          schedules to make sure the rounding behavior, interest accrual, and
          final-month logic all line up.
        </p>
        <p>
          Edge cases like balloon payments, biweekly schedules, and
          near-final-month rounding are where amortization calculators most
          often disagree, so reader feedback on those cases is especially
          valuable. If you compare LoanChop to your bank&apos;s schedule and
          see a discrepancy, please email me — I&apos;d rather fix a bug than
          defend one.
        </p>

        <h2>A note on appropriate use</h2>
        <p>
          LoanChop is an educational tool, not financial advice. It does not
          model the tax effects of mortgage interest deduction, prepayment
          penalties, escrow changes, or the opportunity cost of paying down a
          low-rate loan instead of investing the extra cash. For decisions that
          depend on your personal tax situation or overall financial plan,
          consult a CPA or a licensed financial advisor.
        </p>

        <hr />

        <h2>About the author</h2>
        <div className="not-prose my-6 flex justify-center">
          <Image
            src="/images/jimmy-raymond.jpg"
            alt="Jimmy Raymond"
            width={225}
            height={225}
            className="h-[225px] w-[225px] rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        </div>
        <p>
          Hi, I&apos;m Jimmy Raymond. I built LoanChop and maintain it. I
          studied at New Mexico Tech and the University of New Mexico, where I
          earned a B.S. in Environmental Engineering and a B.S. in Computer
          Science. The two degrees are what made this site possible —
          environmental engineering gave me the dimensional-analysis discipline
          that keeps the units honest, and computer science gave me the tools
          to turn equations into software a stranger can use in thirty seconds.
        </p>
        <p>
          My professional work has spanned safety-critical aerospace and space
          systems, real-time embedded software, and full-stack web development.
          I&apos;ve shipped code to the standards used for aircraft, medical
          devices, and nuclear systems — contexts where &ldquo;almost
          right&rdquo; isn&apos;t right. That discipline shapes how LoanChop is
          built: the formula has to be correct, the assumptions have to be
          stated, and the limits of the tool have to be honest.
        </p>
        <p>I&apos;m based in Albuquerque, New Mexico.</p>

        <h2>Contact</h2>
        <p>
          Email me at{" "}
          <a href="mailto:aj@ajdesigner.com" className="underline decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-700 dark:hover:decoration-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm">aj@ajdesigner.com</a> for
          corrections, feature requests, or general feedback. You can also find
          me on{" "}
          <a
            href="https://www.linkedin.com/in/jimmyraymond/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Jimmy Raymond on LinkedIn (opens in new tab)"
            className="underline decoration-slate-300 hover:decoration-slate-500 dark:decoration-slate-700 dark:hover:decoration-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            LinkedIn
          </a>
          .
        </p>
        <p>— Jimmy</p>
      </article>
    </>
  );
}
