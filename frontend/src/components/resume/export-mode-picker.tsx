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
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "gap-3 lg:grid-cols-2")}>
      {EXPORT_MODE_OPTIONS.map((mode) => {
        const active = selected === mode.value;
        return (
          <button
            key={mode.value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(mode.value)}
            title={compact ? `${mode.description} ${mode.bestFor}` : undefined}
            className={cn(
              "border text-left transition disabled:cursor-not-allowed disabled:opacity-60",
              compact
                ? cn(
                  "rounded-lg px-2.5 py-2",
                  active
                    ? "border-primary/60 bg-primary/12 ring-1 ring-primary/25"
                    : "border-white/10 bg-card/35 hover:border-white/18 hover:bg-card/55",
                )
                : cn(
                  "rounded-2xl p-4",
                  active
                    ? "border-primary/70 bg-primary/10 ring-2 ring-primary/25"
                    : "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/60",
                ),
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "font-heading font-semibold text-foreground",
                  compact ? "text-[0.72rem] leading-tight" : "text-sm",
                )}
              >
                {mode.label}
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-px font-medium uppercase tracking-[0.14em]",
                  compact ? "text-[0.55rem]" : "text-[0.65rem]",
                  active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {mode.value}
              </span>
            </div>
            {!compact ? (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-foreground/70">{mode.bestFor}</p>
              </>
            ) : (
              <p className="mt-1 line-clamp-2 text-[0.62rem] leading-snug text-muted-foreground">{mode.bestFor}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
