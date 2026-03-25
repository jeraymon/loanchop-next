import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — LoanChop",
  description: "Terms of use, disclaimer, and limitation of liability for LoanChop calculators.",
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>Terms of Use</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 15, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using LoanChop (&ldquo;loanchop.com,&rdquo; the &ldquo;Site&rdquo;),
        you agree to be bound by these Terms of Use. If you do not agree to all of these terms,
        do not use the Site.
      </p>

      <h2>2. Educational and Informational Use Only</h2>
      <p>
        All calculators, formulas, results, and content provided on this Site are for
        <strong> educational and informational purposes only</strong>. They are not intended to
        serve as professional engineering, scientific, financial, medical, or legal advice.
        You must not rely on any calculation or information from this Site as a substitute
        for professional judgment, independent verification, or consultation with a qualified
        professional.
      </p>

      <h2>3. No Warranty — &ldquo;As Is&rdquo;</h2>
      <p>
        The Site and all content, tools, and results are provided <strong>&ldquo;as is&rdquo;
        and &ldquo;as available&rdquo;</strong> without warranty of any kind, whether express,
        implied, statutory, or otherwise. To the fullest extent permitted by applicable law,
        LoanChop disclaims all warranties, including but not limited to implied warranties
        of merchantability, fitness for a particular purpose, accuracy, completeness,
        reliability, and non-infringement.
      </p>
      <p>
        LoanChop does not warrant that calculator results will be accurate, error-free,
        or uninterrupted, or that defects will be corrected. Rounding, floating-point
        representation, unit conversion factors, and formula simplifications may introduce
        discrepancies between results shown on this Site and results obtained by other methods.
      </p>

      <h2>4. Assumption of Risk</h2>
      <p>
        <strong>You assume all risk</strong> arising from your use of or reliance on any
        content, calculations, or results obtained from this Site. You are solely responsible
        for independently verifying any result before using it in any application, including
        but not limited to engineering design, construction, manufacturing, financial
        decisions, academic submissions, or any safety-critical context.
      </p>

      <h2>5. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, in no event shall LoanChop,
        its owner, contributors, or affiliates be liable for any direct, indirect, incidental,
        special, consequential, or punitive damages — including but not limited to loss of
        profits, data, use, goodwill, or other intangible losses — arising out of or in
        connection with:
      </p>
      <ul>
        <li>Your access to or use of (or inability to use) the Site;</li>
        <li>Any errors, inaccuracies, or omissions in calculator results or content;</li>
        <li>Any action taken or decision made in reliance on information provided by the Site;</li>
        <li>Any unauthorized access to or alteration of your data or transmissions;</li>
        <li>Any third-party content, advertising, or links accessible through the Site.</li>
      </ul>
      <p>
        This limitation applies regardless of the legal theory (contract, tort, strict
        liability, or otherwise), even if LoanChop has been advised of the possibility
        of such damages.
      </p>

      <h2>6. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless LoanChop and its owner from
        and against any claims, liabilities, damages, losses, and expenses (including
        reasonable attorneys&rsquo; fees) arising out of or related to your use of the Site,
        your violation of these Terms, or your violation of any rights of a third party.
      </p>

      <h2>7. Intellectual Property</h2>
      <p>
        All content on this Site — including text, graphics, formulas, code, logos, and
        design — is the property of LoanChop or its licensors and is protected by
        applicable intellectual property laws. You may not reproduce, distribute, or create
        derivative works from Site content without prior written permission.
      </p>

      <h2>8. Third-Party Services and Advertising</h2>
      <p>
        This Site uses third-party services, including Google AdSense for advertising. These
        services may collect data as described in our <a href="/privacy">Privacy Policy</a>.
        LoanChop is not responsible for the content, practices, or policies of any
        third-party service.
      </p>

      <h2>9. Modifications</h2>
      <p>
        LoanChop reserves the right to modify these Terms at any time. Changes are
        effective upon posting to this page with an updated &ldquo;Last updated&rdquo; date.
        Your continued use of the Site after changes constitutes acceptance of the revised
        Terms.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the
        United States. Any disputes arising under or in connection with these Terms shall
        be subject to the exclusive jurisdiction of the courts in the applicable state or
        federal jurisdiction.
      </p>

      <h2>11. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable or invalid, that
        provision shall be limited or eliminated to the minimum extent necessary, and the
        remaining provisions shall remain in full force and effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms may be directed to{" "}
        <a href="mailto:aj@ajdesigner.com">aj@ajdesigner.com</a>.
      </p>
    </article>
  );
}
