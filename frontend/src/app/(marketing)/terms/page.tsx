import type { Metadata } from "next";

import { MarketingDocShell } from "@/components/marketing/marketing-doc-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using ResumeForge AI — account, AI, exports, and acceptable use.",
};

export default function TermsOfServicePage() {
  return (
    <MarketingDocShell title="Terms of Service" updated="April 2026">
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Agreement</h2>
        <p>
          By creating an account or using ResumeForge AI, you agree to these terms for that deployment. If you are
          using someone else&apos;s hosted instance, that operator may publish additional terms.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">The service</h2>
        <p>
          ResumeForge AI provides tools to draft and edit résumés, generate optional cover-letter drafts, track
          applications, and purchase PDF export unlocks. Features may change as the product evolves; this document may
          be updated with a new &quot;Last updated&quot; date.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Accounts and acceptable use</h2>
        <p>
          You must provide accurate registration information where requested, keep credentials confidential, and not
          misuse the service (including attempting to access others&apos; data, probing for vulnerabilities, or
          overloading infrastructure). We may suspend accounts that create risk or abuse shared systems.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">AI output</h2>
        <p>
          AI-generated text is assistive. <span className="text-foreground/90">You must verify</span> facts, dates, and
          claims before submitting materials to employers. The service does not guarantee interviews or offers.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Paid export unlock</h2>
        <p>
          PDF export for a given résumé may require a one-time purchase processed by Stripe. Pricing displayed at
          checkout is authoritative. Unlock scope (which résumé, regeneration rules) follows the in-product description
          at purchase time. Chargebacks and disputes are handled under card-network rules and Stripe&apos;s processes.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Disclaimer</h2>
        <p>
          The service is provided &quot;as is&quot; to the maximum extent permitted by law. We do not warrant
          uninterrupted operation or that exports will meet every employer&apos;s technical requirements, though we
          design sensible ATS and designed export paths.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Limitation of liability</h2>
        <p>
          To the extent permitted by law, the operator&apos;s aggregate liability arising from the service is limited
          to the amount you paid for the specific export unlock at issue in the twelve months preceding the claim, or
          zero if you only used free features.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Contact</h2>
        <p>
          Billing and product support contacts are listed on the Support page when configured for your deployment.
        </p>
      </section>
    </MarketingDocShell>
  );
}
