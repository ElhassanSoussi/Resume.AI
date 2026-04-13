"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { TEMPLATE_SHOWCASE } from "@/components/marketing/content/marketing-copy";
import { MARKETING_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/marketing/motion";
import { SectionShell } from "@/components/marketing/section-shell";

export function TemplateShowcaseSection() {
  return (
    <SectionShell
      id="templates"
      eyebrow="Layouts"
      title={
        <>
          Designed templates +{" "}
          <span className="text-gradient-brand">an ATS-safe path</span>
        </>
      }
      subtitle="Pick a white-paper layout for humans; switch to ATS Export when the portal demands a plainer file. Your content moves with you."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {TEMPLATE_SHOWCASE.map((tpl, i) => (
          <FadeIn key={tpl.id} delay={i * 0.06}>
            <motion.div
              whileHover={{ y: -6, rotateX: 2 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{ transformStyle: "preserve-3d" }}
              className="h-full"
            >
              <div className={`card-3d flex h-full flex-col overflow-hidden ${tpl.gradientClass}`}>
                <div className="relative h-40 border-b border-white/10 bg-black/20">
                  <div className="absolute inset-4 rounded-lg border border-white/10 bg-background/40 p-3 shadow-inner backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/30" />
                      <div className="flex-1 space-y-1.5 pt-1">
                        <div className="h-1.5 w-3/4 rounded bg-white/20" />
                        <div className="h-1.5 w-1/2 rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="h-12 rounded bg-white/10" />
                      <div className="h-12 rounded bg-white/5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">{tpl.tagline}</p>
                  <h3 className="mt-2 font-heading text-xl font-bold">{tpl.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{tpl.description}</p>
                </div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>
      <FadeIn className="mt-12 flex justify-center" delay={0.12}>
        <Button size="lg" variant="outline" asChild>
          <Link href={MARKETING_ROUTES.examples}>Layout examples & deep dives</Link>
        </Button>
      </FadeIn>
    </SectionShell>
  );
}
