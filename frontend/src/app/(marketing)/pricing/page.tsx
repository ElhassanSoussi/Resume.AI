import type { Metadata } from "next";
import Link from "next/link";

import {
  LANDING_FAQ,
  PRICING_FAQ_EXTRA,
  PRICING_PREVIEW_PLANS,
} from "@/components/marketing/content/marketing-copy";
import { FaqSection } from "@/components/marketing/faq-section";
import { PricingComparisonTable } from "@/components/marketing/pricing-comparison-table";
import { SectionShell } from "@/components/marketing/section-shell";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaSection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "ResumeForge AI pricing: build and iterate for free; pay once per resume when you unlock PDF export via Stripe.",
};

export default function PricingPage() {
  const faqItems = [...LANDING_FAQ, ...PRICING_FAQ_EXTRA];

  return (
    <>
      <div className="mesh-bg border-b border-white/5">
        <div className="marketing-section !pb-14 !pt-20 sm:!pt-28">
          <div className="mx-auto max-w-6xl text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Pay when you <span className="text-gradient-brand">ship the PDF</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Drafting, preview, AI assist, tailoring, cover letters, and tracking stay on the house. Checkout unlocks
              print-ready PDFs for one resume at a time — amount shown clearly in Stripe before you confirm.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={AUTH_ROUTES.signup}>Start for $0</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SectionShell
        eyebrow="Plans"
        title="Two clear stages"
        subtitle="Everything except file export is included while you work. Export unlock is per resume, not per month."
        align="center"
        className="!pt-16"
      >
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {PRICING_PREVIEW_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.highlighted
                  ? "card-3d relative overflow-hidden border-primary/35 shadow-[0_0_70px_-20px_var(--glow)]"
                  : "card-3d"
              }
            >
              {plan.highlighted ? (
                <div className="absolute right-4 top-4 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  At checkout
                </div>
              ) : null}
              <div className="flex h-full flex-col p-6 sm:p-8">
                <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
                <div className="mt-8 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.cadence}</span>
                </div>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-10 w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                  <Link href={AUTH_ROUTES.signup}>{plan.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Compare"
        title="What changes after unlock"
        subtitle="You keep the full workspace either way — export adds file generation you can repeat for that resume."
        className="border-t border-white/5 bg-background/40 !pt-20"
      >
        <PricingComparisonTable />
      </SectionShell>

      <FaqSection
        items={faqItems}
        id="pricing-faq"
        eyebrow="FAQ"
        title={
          <>
            Billing & <span className="text-gradient-brand">policies</span>
          </>
        }
        subtitle="Exports, Stripe checkout, AI behavior, and how we talk about refunds."
        className="!pt-20"
      />

      <CtaSection />
    </>
  );
}
