"use client";

import Link from "next/link";

import { APP_TAGLINE } from "@/lib/constants";
import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";

const stats = [
  { label: "Layout engines", value: "3" },
  { label: "Time to first PDF", value: "<15m" },
  { label: "Your voice", value: "100%" },
] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
      {/* Background sits below all hero content */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 mesh-bg animate-mesh"
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        {/* Static copy (no opacity entrance) so headline/CTAs never render invisible */}
        <div className="min-w-0 max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-foreground/70">
            Resume intelligence
          </p>
          <h1 className="text-balance font-heading text-4xl font-extrabold leading-[1.06] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]">
            Forge a resume that <span className="text-hero-accent">feels cinematic</span>, reads clear,
            and ships fast.
          </h1>
          <p className="marketing-body mt-8 max-w-xl text-lg sm:text-xl">
            {APP_TAGLINE}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button size="lg" className="btn-inset rounded-full px-7" asChild>
              <Link href={AUTH_ROUTES.signup}>Start free</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-white/18 bg-white/[0.03] px-7"
              asChild
            >
              <Link href={MARKETING_ROUTES.examples}>Browse examples</Link>
            </Button>
          </div>
          <dl className="mt-16 grid grid-cols-3 gap-4 border-t border-white/10 pt-12 sm:max-w-lg">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground/65">
                  {s.label}
                </dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {s.value}
                </dd>
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
