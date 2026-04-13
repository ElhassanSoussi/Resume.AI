"use client";

import Link from "next/link";

import { APP_TAGLINE } from "@/lib/constants";
import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";

const stats = [
  { label: "Export modes", value: "ATS + Designed" },
  { label: "Designed layouts", value: "9+" },
  { label: "AI stance", value: "Fact-first" },
] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10 mesh-bg animate-mesh" aria-hidden />
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <div className="min-w-0 max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/70">
            Resume · tailor · apply
          </p>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-[1.06] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.2rem] lg:leading-[1.05]">
            A serious workspace for the{" "}
            <span className="text-hero-accent">whole job search</span> — not just another template.
          </h1>
          <p className="marketing-body mt-6 max-w-xl text-lg sm:text-xl">{APP_TAGLINE}</p>
          <p className="marketing-body mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Generic tools stop at formatting. ResumeForge is built for the arc: write, align to postings, document
            outreach, and ship PDFs you can defend in an interview.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button size="lg" className="btn-inset rounded-full px-7" asChild>
              <Link
                href={AUTH_ROUTES.signup}
                onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_SIGNUP_CLICK, { placement: "hero" })}
              >
                Start free
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-white/18 bg-white/[0.03] px-7"
              asChild
            >
              <Link
                href={MARKETING_ROUTES.pricing}
                onClick={() => track(ANALYTICS_EVENTS.LANDING_CTA_PRICING_CLICK, { placement: "hero" })}
              >
                View pricing
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href={MARKETING_ROUTES.examples} className="font-medium text-primary underline-offset-4 hover:underline">
              Browse layout examples
            </Link>{" "}
            — see how designed templates and ATS paths differ.
          </p>
          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-white/10 pt-10 sm:max-w-lg">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/65">
                  {s.label}
                </dt>
                <dd className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative z-10 min-w-0 lg:z-[5]">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
