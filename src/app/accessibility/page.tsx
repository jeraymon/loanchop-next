import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement — LoanChop",
  description: "LoanChop's commitment to web accessibility and WCAG 2.1 AA compliance.",
};

export default function AccessibilityPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>Accessibility Statement</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 15, 2026</p>

      <h2>Our Commitment</h2>
      <p>
        LoanChop is committed to ensuring digital accessibility for people of all
        abilities. We strive to continually improve the user experience for everyone and
        apply the relevant accessibility standards to make our calculators and content
        usable by the widest possible audience.
      </p>

      <h2>Conformance Standard</h2>
      <p>
        We aim to conform to the{" "}
        <a href="https://www.w3.org/TR/WCAG21/" target="_blank" rel="noopener noreferrer">
          Web Content Accessibility Guidelines (WCAG) 2.1
        </a>{" "}
        at the AA level. These guidelines explain how to make web content more accessible
        to people with disabilities, including those with visual, auditory, motor, speech,
        cognitive, language, learning, and neurological disabilities.
      </p>

      <h2>Accessibility Features</h2>
      <p>We have implemented the following accessibility features across the Site:</p>
      <ul>
        <li>
          <strong>Semantic HTML:</strong> Proper use of headings, landmarks, lists, and
          form labels to support screen readers and assistive technologies.
        </li>
        <li>
          <strong>Keyboard navigation:</strong> All interactive elements (buttons, dropdowns,
          links) are fully operable via keyboard with visible focus indicators.
        </li>
        <li>
          <strong>Color contrast:</strong> Text and interactive elements meet WCAG AA
          contrast ratio requirements (minimum 4.5:1 for normal text, 3:1 for large text).
        </li>
        <li>
          <strong>Screen reader support:</strong> Mathematical formulas include screen
          reader-only text descriptions. Calculator results use <code>aria-live</code>{" "}
          regions to announce updates. The active page is indicated with{" "}
          <code>aria-current=&quot;page&quot;</code>.
        </li>
        <li>
          <strong>Responsive design:</strong> The Site is usable across screen sizes from
          mobile devices to large desktop monitors.
        </li>
        <li>
          <strong>Dark mode:</strong> A dark color scheme is available to reduce eye strain
          and improve readability in low-light environments.
        </li>
        <li>
          <strong>Navigation:</strong> The sidebar uses a semantic <code>&lt;nav&gt;</code>{" "}
          element with an accessible label. The sidebar pushes content rather than overlaying
          it, ensuring all content remains visible and interactive.
        </li>
      </ul>

      <h2>Known Limitations</h2>
      <p>
        While we strive for full accessibility, some limitations may exist:
      </p>
      <ul>
        <li>
          Third-party content, including advertisements served by Google AdSense, may not
          fully conform to WCAG 2.1 AA standards. We do not control the accessibility of
          third-party ad content.
        </li>
        <li>
          Some mathematical notation rendered via KaTeX may not be fully interpretable by
          all screen readers. We provide plain-text alternatives for all formulas.
        </li>
      </ul>

      <h2>Feedback</h2>
      <p>
        We welcome your feedback on the accessibility of LoanChop. If you encounter
        any accessibility barriers or have suggestions for improvement, please contact us
        at <a href="mailto:aj@ajdesigner.com">aj@ajdesigner.com</a>. We take accessibility
        feedback seriously and will make reasonable efforts to address reported issues.
      </p>

      <h2>Enforcement and Complaint Procedures</h2>
      <p>
        If you are not satisfied with our response to your accessibility concern, you may
        file a complaint with the{" "}
        <a href="https://www.ada.gov/file-a-complaint/" target="_blank" rel="noopener noreferrer">
          U.S. Department of Justice
        </a>{" "}
        or contact your local accessibility enforcement authority.
      </p>
    </article>
  );
}
