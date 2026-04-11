"use client";

import { motion } from "framer-motion";

/** Abstract stacked “resume” panes + export preview — premium glass depth. */
export function HeroVisual() {
  return (
    <div className="perspective-wrap relative mx-auto mt-16 max-w-lg lg:mt-0 lg:max-w-none">
      <motion.div
        className="relative h-[280px] sm:h-[320px]"
        initial={{ opacity: 1, rotateX: 8 }}
        animate={{ opacity: 1, rotateX: 8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Vertical glow spine — depth cue behind glass */}
        <div
          className="pointer-events-none absolute left-1/2 top-[8%] z-0 h-[78%] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/35 to-transparent blur-[1px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.12] bg-gradient-to-br from-card/85 to-card/25 shadow-[0_48px_100px_-28px_rgba(0,0,0,0.72),0_0_0_1px_oklch(1_0_0/0.04)_inset] backdrop-blur-md"
          style={{ transform: "translateZ(0px) translateY(0)" }}
        />
        <motion.div
          className="absolute inset-x-6 top-6 z-[1] rounded-xl border border-white/[0.1] bg-background/55 p-4 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] backdrop-blur-sm ring-1 ring-white/[0.06]"
          style={{ transform: "translateZ(24px) translateY(-8px)" }}
          whileHover={{ y: -12 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="mb-3 h-2 w-1/3 rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded bg-muted/80" />
            <div className="h-1.5 w-[92%] rounded bg-muted/60" />
            <div className="h-1.5 w-4/5 rounded bg-muted/50" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-16 rounded-lg bg-primary/18 ring-1 ring-primary/30 shadow-[0_0_24px_-4px_oklch(0.55_0.2_255/0.45)]" />
            <div className="h-16 rounded-lg bg-white/[0.06]" />
            <div className="h-16 rounded-lg bg-white/[0.06]" />
          </div>
        </motion.div>
        <motion.div
          className="absolute inset-x-10 top-[5.25rem] z-[2] rounded-xl border border-white/12 bg-gradient-to-b from-primary/[0.08] to-card/40 p-4 shadow-[0_28px_56px_-18px_rgba(0,0,0,0.65),0_0_0_1px_oklch(0.72_0.2_255/0.18),0_0_48px_-12px_oklch(0.55_0.18_255/0.35)] backdrop-blur-md ring-1 ring-primary/25"
          style={{ transform: "translateZ(48px) translateY(12px)" }}
          initial={{ opacity: 0.92 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Export preview
          </p>
          <p className="mt-1.5 font-heading text-sm font-semibold tracking-tight text-foreground">
            PDF · Minimal Pro
          </p>
          <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
          <p className="mt-2.5 text-[11px] leading-relaxed text-foreground/72">
            Print-safe margins · live fonts · download metadata
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
