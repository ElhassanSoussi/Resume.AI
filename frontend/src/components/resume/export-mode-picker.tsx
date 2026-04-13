"use client";

import { cn } from "@/lib/utils";
import {
  EXPORT_MODE_OPTIONS,
  type ResumeExportMode,
} from "@/lib/resume/constants";

type Props = {
  selected: ResumeExportMode;
  onSelect: (value: ResumeExportMode) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function ExportModePicker({ selected, onSelect, disabled, compact = false }: Props) {
  return (
    <div className={cn("grid gap-3", compact ? "md:grid-cols-2" : "lg:grid-cols-2")}>
      {EXPORT_MODE_OPTIONS.map((mode) => {
        const active = selected === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(mode.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              active
                ? "border-primary/70 bg-primary/10 ring-2 ring-primary/25"
                : "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/60",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading text-sm font-semibold text-foreground">{mode.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.16em]",
                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {mode.value}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-foreground/70">{mode.bestFor}</p>
          </button>
        );
      })}
    </div>
  );
}
