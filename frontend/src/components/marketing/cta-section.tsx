"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";

export function CtaSection() {
  return (
    <section className="px-4 pb-20 pt-4 sm:px-6 sm:pb-28">
      <FadeIn className="mx-auto max-w-6xl">
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-card/90 to-accent/15 p-10 shadow-[0_40px_100px_-40px_var(--glow)] sm:p-14"
          whileHover={{ scale: 1.008 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ready when you are</p>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Show up with a resume that reads intentional
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Open a free workspace, ship when the PDF is worth paying for. Stripe handles payment; you keep control of every line.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="min-w-[200px]" asChild>
                <Link
                  href={AUTH_ROUTES.signup}
                  onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_SIGNUP_FOOTER, { placement: "cta_section" })}
                >
                  Create your workspace
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[200px] bg-background/40" asChild>
                <Link
                  href={MARKETING_ROUTES.pricing}
                  onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_PRICING_CLICK, { placement: "cta_section" })}
                >
                  Pricing & FAQ
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </FadeIn>
    </section>
  );
}
