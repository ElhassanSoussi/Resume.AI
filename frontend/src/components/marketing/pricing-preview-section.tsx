"use client";

import Link from "next/link";

import { PRICING_PREVIEW_PLANS } from "@/components/marketing/content/marketing-copy";
import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

export function PricingPreviewSection() {
  return (
    <SectionShell
      id="pricing-preview"
      eyebrow="Pricing"
      title={
        <>
          Start free. <span className="text-gradient-brand">Pay to export.</span>
        </>
      }
      subtitle="No surprise limits in the editor — you unlock PDF when you’re ready to ship to recruiters."
      className="border-t border-white/5"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_PREVIEW_PLANS.map((plan, i) => (
          <FadeIn key={plan.name} delay={i * 0.05}>
            <div
              className={
                plan.highlighted
                  ? "card-3d relative overflow-hidden border-primary/35 shadow-[0_0_60px_-18px_var(--glow)]"
                  : "card-3d"
              }
            >
              {plan.highlighted ? (
                <div className="absolute right-4 top-4 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Popular
                </div>
              ) : null}
              <div className="flex h-full flex-col p-6 sm:p-8">
                <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.cadence}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link
                    href={
                      plan.name === "Teams" ? AUTH_ROUTES.login : AUTH_ROUTES.signup
                    }
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
      <FadeIn className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row" delay={0.1}>
        <Button variant="link" asChild>
          <Link href={MARKETING_ROUTES.pricing}>Compare plans in detail</Link>
        </Button>
      </FadeIn>
    </SectionShell>
  );
}
