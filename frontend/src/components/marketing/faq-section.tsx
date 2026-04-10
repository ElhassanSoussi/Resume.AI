"use client";

import type { ReactNode } from "react";

import type { FaqItem } from "@/components/marketing/content/marketing-copy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeIn } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

type FaqSectionProps = {
  items: FaqItem[];
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: string;
  className?: string;
};

export function FaqSection({
  items,
  id = "faq",
  eyebrow = "FAQ",
  title = (
    <>
      Questions, <span className="text-gradient-brand">answered</span>
    </>
  ),
  subtitle = "Everything you need to know before you ship your next PDF.",
  className,
}: FaqSectionProps) {
  return (
    <SectionShell
      id={id}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      className={className}
    >
      <FadeIn>
        <Accordion
          defaultValue={items[0] ? [items[0].id] : []}
          className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-card/30 px-2 backdrop-blur-sm"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-0 px-4 py-1">
              <AccordionTrigger className="py-5 text-base hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-4 text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </SectionShell>
  );
}
