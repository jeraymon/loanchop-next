export const SITE_NAME = "LoanChop";
export const SITE_URL = "https://www.loanchop.com";
export const OG_IMAGE = {
  url: "https://www.loanchop.com/images/og-default.jpg",
  width: 1200,
  height: 630,
  alt: "LoanChop Loan Prepayment Calculator",
};

// Canonical Person @id used across the entire 15-site network. Every site's
// Organization.founder and every calc page's HowTo.author should reference
// this exact @id so Google consolidates the founder into a single Knowledge
// Graph entity instead of 15 disconnected "Jimmy Raymond" Persons.
export const CANONICAL_PERSON_ID = "https://www.ajdesigner.com/about/#jimmy";
export const CANONICAL_PERSON_URL = "https://www.ajdesigner.com/about/";

// Sister-site about page URLs. Update this list as more sites ship /about/.
// Used by buildPersonJsonLd.sameAs and by the AuthorByline link target.
export const SISTER_ABOUT_URLS = [
  "https://www.ajdesigner.com/about/",
  "https://www.bogodiscount.com/about/",
  "https://www.cameradof.com/about/",
  "https://www.compare2loans.com/about/",
  "https://www.dollarsperhour.com/about/",
  "https://www.hourlysalaries.com/about/",
  "https://www.infantchart.com/about/",
  "https://www.loanchop.com/about/",
  "https://www.medicalequations.com/about/",
  "https://www.optionsmath.com/about/",
  "https://www.percenterrorcalculator.com/about/",
  "https://www.percentoffcalculator.com/about/",
  "https://www.rncalc.com/about/",
  "https://www.temperaturetool.com/about/",
  "https://www.zscorecalculator.com/about/",
];

interface BuildPersonJsonLdArgs {
  /** Local site URL (e.g., "https://www.ajdesigner.com"). The Person's @id and url
   *  on the local about page resolve under this site so the local /about/ page is
   *  self-contained, while still cross-linking to the canonical via sameAs. */
  siteUrl: string;
  /** Per-site knowsAbout array — tailor to the topics this site covers. */
  knowsAbout: string[];
  /** Person description sentence — typically references the site name. */
  description: string;
}

/** Builds the Person JSON-LD block used on /about/ pages. The Person's local
 *  @id resolves to {siteUrl}/about/#jimmy; sameAs lists every sister site's
 *  /about/ URL so Google merges the entity across all 15 sites. */
export function buildPersonJsonLd({ siteUrl, knowsAbout, description }: BuildPersonJsonLdArgs) {
  const localAboutUrl = `${siteUrl}/about/`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/about/#jimmy`,
    name: "Jimmy Raymond",
    url: localAboutUrl,
    description,
    image: `${siteUrl}/images/jimmy-raymond.jpg`,
    jobTitle: "Engineer",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "New Mexico Institute of Mining and Technology" },
      { "@type": "CollegeOrUniversity", name: "University of New Mexico" },
    ],
    knowsAbout,
    email: "aj@ajdesigner.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Albuquerque",
      addressRegion: "NM",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.linkedin.com/in/jimmyraymond/",
      ...SISTER_ABOUT_URLS.filter((url) => url !== localAboutUrl),
    ],
  };
}

interface BuildOrganizationFounderArgs {
  /** Local site URL — used only to choose between the schema-only reference
   *  (for sites with their own /about/) and the inline form. */
  siteUrl: string;
}

/** Builds the founder block for an Organization JSON-LD. For the canonical
 *  ajdesigner site, returns a schema-only reference. For all other sites,
 *  returns an inline minimal Person pointing to the canonical @id, so the
 *  Person is at least self-contained on each page while still consolidating
 *  to the canonical entity. */
export function buildOrganizationFounder({ siteUrl }: BuildOrganizationFounderArgs) {
  if (siteUrl === "https://www.ajdesigner.com") {
    return { "@id": CANONICAL_PERSON_ID };
  }
  const localAboutUrl = `${siteUrl}/about/`;
  return {
    "@type": "Person",
    "@id": CANONICAL_PERSON_ID,
    name: "Jimmy Raymond",
    url: CANONICAL_PERSON_URL,
    jobTitle: "Engineer",
    sameAs: [
      "https://www.linkedin.com/in/jimmyraymond/",
      ...SISTER_ABOUT_URLS.filter((url) => url !== localAboutUrl),
    ],
  };
}
