"use client";

import { motion } from "framer-motion";

/** Abstract stacked “resume” panes for cinematic hero depth. */
export function HeroVisual() {
  return (
    <div className="perspective-wrap relative mx-auto mt-16 max-w-lg lg:mt-0 lg:max-w-none">
      <motion.div
        className="relative h-[280px] sm:h-[320px]"
        initial={{ opacity: 0, rotateX: 12 }}
        animate={{ opacity: 1, rotateX: 8 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="absolute inset-0 rounded-2xl border border-white/10 bg-gradient-to-br from-card/80 to-card/30 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-md"
          style={{ transform: "translateZ(0px) translateY(0)" }}
        />
        <motion.div
          className="absolute inset-x-6 top-6 rounded-xl border border-white/10 bg-background/60 p-4 shadow-xl backdrop-blur-sm"
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
            <div className="h-16 rounded-lg bg-primary/15 ring-1 ring-primary/25" />
            <div className="h-16 rounded-lg bg-white/5" />
            <div className="h-16 rounded-lg bg-white/5" />
          </div>
        </motion.div>
        <motion.div
          className="absolute inset-x-10 top-24 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-lg backdrop-blur-sm"
          style={{ transform: "translateZ(48px) translateY(12px)" }}
          initial={{ opacity: 0.85 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-primary">
            Export preview
          </p>
          <p className="mt-1 font-heading text-sm font-semibold">PDF · Minimal Pro</p>
          <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Print-safe margins · live fonts · download metadata
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
