"use client";

import { HOW_IT_WORKS_STEPS } from "@/components/marketing/content/marketing-copy";
import { FadeIn, Stagger, StaggerItem } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

export function HowItWorksSection() {
  return (
    <SectionShell
      id="how-it-works"
      eyebrow="Flow"
      title="How you move from blank page to send"
      subtitle="Same narrative the app uses: build → tune → tailor → document → export. No hidden lanes."
      className="border-t border-white/5 bg-background/50"
    >
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {HOW_IT_WORKS_STEPS.map((item) => (
          <StaggerItem key={item.step}>
            <div className="card-3d group flex h-full flex-col p-5 sm:p-6">
              <span className="font-heading text-3xl font-bold text-primary/90">{item.step}</span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
      <FadeIn className="mt-12 text-center" delay={0.15}>
        <p className="text-sm text-muted-foreground">
          First successful PDF is usually faster when you paste an existing resume — then use AI and tailoring to sharpen for each employer.
        </p>
      </FadeIn>
    </SectionShell>
  );
}
