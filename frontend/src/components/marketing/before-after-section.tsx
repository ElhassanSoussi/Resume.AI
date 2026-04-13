"use client";

import { ArrowRight } from "lucide-react";

import { BEFORE_AFTER } from "@/components/marketing/content/marketing-copy";
import { FadeIn } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

export function BeforeAfterSection() {
  return (
    <SectionShell
      id="before-after"
      eyebrow="Proof"
      title={
        <>
          From vague duties to{" "}
          <span className="text-gradient-brand">outcomes readers trust</span>
        </>
      }
      subtitle="Generic resume tools swap fonts. ResumeForge helps you express what you actually did — so hiring teams see scope, impact, and craft, not filler."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <FadeIn>
          <div className="card-3d h-full p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {BEFORE_AFTER.before.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{BEFORE_AFTER.before.subtitle}</p>
            <ul className="mt-6 space-y-4 border-l-2 border-white/10 pl-4">
              {BEFORE_AFTER.before.lines.map((line) => (
                <li key={line} className="text-sm leading-relaxed text-muted-foreground">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="card-3d relative h-full overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{BEFORE_AFTER.after.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{BEFORE_AFTER.after.subtitle}</p>
            <ul className="mt-6 space-y-4">
              {BEFORE_AFTER.after.lines.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-foreground/95">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gradient-to-br from-[var(--brand-electric)] to-[var(--brand-teal)]" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-2 text-xs font-medium text-primary">
              <span>Illustrative tightening — your facts stay yours</span>
              <ArrowRight className="size-3.5" aria-hidden />
            </div>
          </div>
        </FadeIn>
      </div>
    </SectionShell>
  );
}
