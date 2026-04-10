"use client";

import { Check, Minus } from "lucide-react";

import { PLAN_COMPARISON } from "@/components/marketing/content/marketing-copy";
import { FadeIn } from "@/components/marketing/motion";

function Cell({ ok }: { ok: boolean }) {
  return (
    <td className="px-4 py-3 text-center">
      {ok ? (
        <Check className="inline size-5 text-primary" aria-label="Included" />
      ) : (
        <Minus className="inline size-5 text-muted-foreground/50" aria-label="Not included" />
      )}
    </td>
  );
}

export function PricingComparisonTable() {
  return (
    <FadeIn>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/30 backdrop-blur-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-4 font-heading text-foreground">Feature</th>
              <th className="px-4 py-4 text-center font-heading">Starter</th>
              <th className="px-4 py-4 text-center font-heading text-primary">Export Pro</th>
              <th className="px-4 py-4 text-center font-heading">Teams</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON.map((row) => (
              <tr key={row.feature} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{row.feature}</td>
                <Cell ok={row.starter} />
                <Cell ok={row.pro} />
                <Cell ok={row.teams} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeIn>
  );
}
