import type { Metadata } from "next";

import { MarketingDocShell } from "@/components/marketing/marketing-doc-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ResumeForge AI handles your data, AI processing, and payments.",
};

export default function PrivacyPolicyPage() {
  return (
    <MarketingDocShell title="Privacy Policy" updated="April 2026">
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Overview</h2>
        <p>
          ResumeForge AI is a productivity product: you provide professional information, and the service helps you
          format, refine, tailor, and export it. This policy describes what we process, why, and how you can exercise
          sensible control. It is not legal advice.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">What you provide</h2>
        <p>
          You submit résumé content, job descriptions for tailoring, cover letter briefs, and job-tracker notes. You are
          responsible for the accuracy of factual claims (employment, dates, education, credentials). The product is
          designed to <span className="text-foreground/90">optimize and reorganize wording you supply</span>, not to
          invent employers or qualifications.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Authentication</h2>
        <p>
          Accounts and sessions are handled through Supabase authentication. Credentials and session tokens are
          managed according to Supabase&apos;s infrastructure; you should protect your login and device.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">AI processing</h2>
        <p>
          When you use AI features, relevant text is sent to the configured AI provider (for example OpenAI or an
          OpenAI-compatible endpoint) to generate suggestions or structured edits. Do not paste highly sensitive
          personal data you are not comfortable sending to that provider. Review AI output before you rely on it.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Payments</h2>
        <p>
          PDF export unlock is sold via Stripe Checkout. Card data is collected by Stripe under their terms; the
          application stores payment status and references needed to fulfill exports, not full card numbers.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Analytics</h2>
        <p>
          The web app may emit anonymized product events (for example funnel steps) through a small client-side layer.
          You can optionally route those events to your own endpoint via configuration — see the repository{" "}
          <code className="rounded bg-white/5 px-1.5 py-0.5 text-foreground/90">ANALYTICS.md</code> file. We do not sell
          your résumé text to data brokers.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Retention and deletion</h2>
        <p>
          Operational retention depends on how the operator configures the database and file storage. Delete content you
          no longer need from inside the product where supported, and contact the operator for account-level deletion
          requests if applicable.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Contact</h2>
        <p>
          For privacy questions, use the support path linked from the footer (Support page). If no contact is
          configured for a self-hosted deployment, reach the operator directly.
        </p>
      </section>
    </MarketingDocShell>
  );
}
