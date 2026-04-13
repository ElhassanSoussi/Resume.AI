import type { Metadata } from "next";
import Link from "next/link";

import { MarketingDocShell } from "@/components/marketing/marketing-doc-shell";
import { MARKETING_ROUTES } from "@/lib/auth/routes";
import { getSupportEmail } from "@/lib/support";

export const metadata: Metadata = {
  title: "Support",
  description: "Help, billing questions, and export issues for ResumeForge AI.",
};

export default function SupportPage() {
  const email = getSupportEmail();

  return (
    <MarketingDocShell title="Support" updated="April 2026">
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Contact</h2>
        {email ? (
          <p>
            Email{" "}
            <a className="font-medium text-primary underline-offset-4 hover:underline" href={`mailto:${email}`}>
              {email}
            </a>{" "}
            for product questions, billing on this deployment, or export issues. Include your account email and, if
            relevant, the résumé title and approximate time of the problem.
          </p>
        ) : (
          <p>
            This deployment has not set a public support address. If you are the operator, configure{" "}
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-foreground/90">NEXT_PUBLIC_SUPPORT_EMAIL</code> in
            the frontend environment.
          </p>
        )}
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Payments & exports</h2>
        <p>
          Payments run on Stripe&apos;s checkout page. If checkout succeeded but the app still shows locked after a few
          minutes, verify your return URL matches the site you paid from, then contact support with the approximate time
          of purchase. For failed PDF generation after an unlock, include export mode (ATS vs designed) and browser.
        </p>
        <p>
          Refund posture is set by the operator; many teams treat export unlocks as digital fulfillment once a file is
          generated — describe your actual policy here when you publish a commercial site.
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Useful links</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>
            <Link className="text-primary underline-offset-4 hover:underline" href={MARKETING_ROUTES.pricing}>
              Pricing & FAQ
            </Link>
          </li>
          <li>
            <Link className="text-primary underline-offset-4 hover:underline" href={MARKETING_ROUTES.privacy}>
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link className="text-primary underline-offset-4 hover:underline" href={MARKETING_ROUTES.terms}>
              Terms of Service
            </Link>
          </li>
        </ul>
      </section>
    </MarketingDocShell>
  );
}
