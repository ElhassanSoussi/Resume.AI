"use client";

import {
  Briefcase,
  FileText,
  PenLine,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

import { STORY_PILLARS } from "@/components/marketing/content/marketing-copy";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

const ICONS = {
  build: FileText,
  ai: Sparkles,
  tailor: Wand2,
  letters: PenLine,
  track: Briefcase,
  export: Send,
} as const;

export function ProductOutcomesSection() {
  return (
    <SectionShell
      id="platform"
      eyebrow="Platform"
      title={
        <>
          One story, from{" "}
          <span className="text-gradient-brand">draft to send</span>
        </>
      }
      subtitle="ResumeForge AI is not a single-purpose editor — it is a calm workflow for serious job search: build, align, document, and ship."
      className="border-t border-white/5"
    >
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STORY_PILLARS.map((pillar, i) => {
          const Icon = ICONS[pillar.id as keyof typeof ICONS] ?? FileText;
          return (
            <StaggerItem key={pillar.id}>
              <FadeIn delay={i * 0.04}>
                <div className="card-3d flex h-full flex-col p-5 sm:p-6">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <Icon className="size-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                </div>
              </FadeIn>
            </StaggerItem>
          );
        })}
      </Stagger>
    </SectionShell>
  );
}
