"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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
    <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
      <div className="pointer-events-none absolute inset-0 mesh-bg animate-mesh" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Resume intelligence
          </p>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.02]">
            Forge a resume that{" "}
            <span className="text-gradient-brand">feels cinematic</span>, reads clear, and ships
            fast.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{APP_TAGLINE}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href={AUTH_ROUTES.signup}>Start free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={MARKETING_ROUTES.examples}>Browse examples</Link>
            </Button>
          </div>
          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-white/10 pt-10 sm:max-w-lg">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </dt>
                <dd className="mt-1 font-heading text-2xl font-bold text-foreground sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <HeroVisual />
      </div>
    </section>
  );
}
