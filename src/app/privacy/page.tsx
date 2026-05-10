import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy — LoanChop",
  description: "Privacy policy for LoanChop, including cookie usage and Google AdSense disclosure.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <div className="not-prose mb-4">
        <Breadcrumbs breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", href: "/privacy/" },
        ]} />
      </div>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 15, 2026</p>

      <h2>1. Overview</h2>
      <p>
        LoanChop (&ldquo;loanchop.com,&rdquo; the &ldquo;Site&rdquo;) respects your
        privacy. This Privacy Policy describes what information is collected when you visit
        the Site, how it is used, and your choices regarding that information.
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        LoanChop does not require you to create an account or provide any personal
        information to use the calculators. We do not collect names, email addresses, or
        other personally identifiable information unless you voluntarily provide it (for
        example, by contacting us).
      </p>

      <h3>Automatically Collected Information</h3>
      <p>
        When you visit the Site, certain non-personally identifiable information may be
        collected automatically, including:
      </p>
      <ul>
        <li>IP address (anonymized where possible)</li>
        <li>Browser type and version</li>
        <li>Operating system</li>
        <li>Referring URL</li>
        <li>Pages visited and time spent on pages</li>
        <li>Device type (desktop, mobile, tablet)</li>
      </ul>
      <p>
        This information is collected through standard web server logs and analytics tools
        to help us understand how the Site is used and to improve its performance.
      </p>

      <h2>3. Cookies and Tracking Technologies</h2>
      <p>
        The Site uses cookies and similar technologies. Cookies are small text files stored
        on your device by your web browser. The Site uses:
      </p>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Required for the Site to function properly
          (e.g., theme preference).
        </li>
        <li>
          <strong>Analytics cookies:</strong> Used to understand how visitors interact with
          the Site. These may be provided by third-party analytics services.
        </li>
        <li>
          <strong>Advertising cookies:</strong> Used by Google AdSense and its partners to
          serve relevant advertisements. See Section 4 below.
        </li>
      </ul>
      <p>
        You can control cookies through your browser settings. Disabling cookies may affect
        the functionality of the Site.
      </p>

      <h2>4. Google AdSense and Third-Party Advertising</h2>
      <p>
        This Site uses Google AdSense to display advertisements. Google and its advertising
        partners may use cookies, web beacons, and similar technologies to serve ads based
        on your prior visits to this Site and other websites. Specifically:
      </p>
      <ul>
        <li>
          Google uses the DoubleClick cookie to serve ads based on your visit to this Site
          and other sites on the Internet.
        </li>
        <li>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </li>
        <li>
          You may also opt out of third-party vendor cookies by visiting{" "}
          <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
            www.aboutads.info/choices
          </a>.
        </li>
      </ul>
      <p>
        For more information about how Google uses data when you use its partners&rsquo;
        sites, visit{" "}
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          Google&rsquo;s Privacy &amp; Terms page
        </a>.
      </p>

      <h2>5. How We Use Information</h2>
      <p>Any information collected is used solely to:</p>
      <ul>
        <li>Operate and maintain the Site</li>
        <li>Analyze usage patterns to improve content and performance</li>
        <li>Serve relevant advertisements through Google AdSense</li>
        <li>Respond to inquiries if you contact us</li>
      </ul>
      <p>
        We do not sell, trade, or rent your personal information to third parties.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        Server logs and analytics data are retained only as long as necessary to fulfill
        the purposes described in this policy. Automatically collected data is typically
        aggregated and anonymized.
      </p>

      <h2>7. Children&rsquo;s Privacy</h2>
      <p>
        The Site is not directed to children under the age of 13. We do not knowingly
        collect personal information from children under 13. If you believe a child has
        provided us with personal information, please contact us so we can delete it.
      </p>

      <h2>8. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may have rights regarding your personal data,
        including the right to access, correct, delete, or restrict processing of your
        data. To exercise these rights, please contact us using the information provided
        on the Site.
      </p>
      <p>
        <strong>California residents (CCPA):</strong> You have the right to know what
        personal information is collected, to request deletion, and to opt out of the
        sale of personal information. We do not sell personal information.
      </p>
      <p>
        <strong>EU/EEA residents (GDPR):</strong> You have the right to access, rectify,
        erase, restrict processing, and port your data. You also have the right to object
        to processing and to lodge a complaint with a supervisory authority.
      </p>

      <h2>9. Third-Party Links</h2>
      <p>
        The Site may contain links to third-party websites. We are not responsible for the
        privacy practices or content of those websites. We encourage you to read the
        privacy policies of any third-party site you visit.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes are effective upon
        posting to this page with an updated &ldquo;Last updated&rdquo; date. Your
        continued use of the Site after changes constitutes acceptance of the revised
        policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or concerns about this Privacy Policy may be directed to{" "}
        <a href="mailto:aj@ajdesigner.com">aj@ajdesigner.com</a>.
      </p>
    </article>
  );
}
