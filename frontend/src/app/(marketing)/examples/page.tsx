import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  EXAMPLE_DEEP_DIVES,
  EXAMPLE_USE_CASES,
  TEMPLATE_SHOWCASE,
} from "@/components/marketing/content/marketing-copy";
import { CtaSection } from "@/components/marketing/cta-section";
import { FadeIn } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";
import { AUTH_ROUTES, MARKETING_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Examples",
  description:
    "Explore ResumeForge layout engines — Minimal Pro, Modern Sidebar, and Executive — built for different career stories.",
};

export default function ExamplesPage() {
  return (
    <>
      <div className="mesh-bg border-b border-white/5">
        <div className="marketing-section !pb-16 !pt-20 sm:!pt-28">
          <div className="mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Examples
            </Badge>
            <h1 className="max-w-4xl font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Layouts engineered for{" "}
              <span className="text-gradient-brand">how you’re evaluated</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Three premium engines share one content model — swap visuals without rewriting. Pick
              the frame that matches your arc: craft-led, technical, or executive.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href={AUTH_ROUTES.signup}>Build yours</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={MARKETING_ROUTES.pricing}>See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SectionShell
        eyebrow="Engines"
        title="Meet the three layouts"
        subtitle="Each template is tuned for PDF export — spacing, type scale, and section order are production-tested."
        className="!pt-16"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          {TEMPLATE_SHOWCASE.map((tpl, i) => (
            <FadeIn key={tpl.id} delay={i * 0.06}>
              <div className={`card-3d flex flex-col overflow-hidden ${tpl.gradientClass}`}>
                <div className="h-44 border-b border-white/10 bg-black/15 p-5">
                  <div className="flex h-full flex-col justify-between rounded-lg border border-white/10 bg-background/50 p-4 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="h-2 w-1/3 rounded bg-muted" />
                      <div className="h-1.5 w-full rounded bg-muted/70" />
                      <div className="h-1.5 w-4/5 rounded bg-muted/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-14 rounded-md bg-primary/20" />
                      <div className="h-14 rounded-md bg-white/5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {tpl.tagline}
                  </p>
                  <h2 className="mt-2 font-heading text-xl font-bold">{tpl.name}</h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tpl.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Deep dives"
        title="Who each layout serves"
        subtitle="Match narrative structure to role — the right frame keeps your strongest proof above the fold."
        className="border-t border-white/5 bg-background/40 !pt-24"
      >
        <div className="space-y-8">
          {EXAMPLE_DEEP_DIVES.map((ex, i) => (
            <FadeIn key={ex.id} delay={i * 0.05}>
              <div className="card-3d flex flex-col gap-6 p-6 sm:flex-row sm:items-start sm:gap-10 sm:p-10">
                <div className="shrink-0 sm:w-48">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {ex.name}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{ex.audience}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base leading-relaxed text-foreground/95">{ex.summary}</p>
                  <ul className="mt-6 space-y-3">
                    {ex.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm text-muted-foreground">
                        <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Use cases"
        title="When candidates switch layouts"
        subtitle="Same facts — different emphasis — without maintaining three separate resumes."
        className="!pt-24"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {EXAMPLE_USE_CASES.map((u, i) => (
            <FadeIn key={u.title} delay={i * 0.06}>
              <div className="card-3d h-full p-6">
                <h3 className="font-heading text-lg font-semibold">{u.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{u.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </SectionShell>

      <CtaSection />
    </>
  );
}
