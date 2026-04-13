"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  RESUME_TEMPLATE_LIBRARY,
  type ResumeExportMode,
  type ResumeTemplateId,
} from "@/lib/resume/constants";
import { APP_ROUTES } from "@/lib/auth/routes";

type Props = {
  selected: ResumeTemplateId;
  /** When set, preview mode links with ?template= */
  resumeId?: string;
  /** `preview` = URL + Link; `editor` = visual only + callback */
  variant: "preview" | "editor";
  onSelect?: (value: ResumeTemplateId) => void;
  disabled?: boolean;
  previewMode?: ResumeExportMode;
};

export function TemplatePicker({
  selected,
  resumeId,
  variant,
  onSelect,
  disabled,
  previewMode,
}: Props) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {RESUME_TEMPLATE_LIBRARY.map((t) => {
        const active = selected === t.value;
        const inner = (
          <span className="flex flex-col gap-2 text-left">
            <span className="flex items-center justify-between gap-3">
              <span className="font-heading text-sm font-semibold">{t.label}</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em]",
                    active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.tone}
                </span>
                {t.atsSafe ? (
                  <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.18em] text-emerald-300">
                    ATS Safe
                  </span>
                ) : null}
              </span>
            </span>
            <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground/65">
              {t.family}
            </span>
            <span className="text-sm leading-relaxed text-muted-foreground">{t.description}</span>
            <span className="text-xs uppercase tracking-[0.16em] text-foreground/70">
              Best for: {t.bestFor}
            </span>
          </span>
        );

        if (variant === "preview" && resumeId && !disabled) {
          const params = new URLSearchParams();
          params.set("template", t.value);
          if (previewMode) params.set("mode", previewMode);
          const href = `${APP_ROUTES.resumePreview(resumeId)}?${params.toString()}`;
          return (
            <Link
              key={t.value}
              href={href}
              scroll={false}
              className={cn(
                "rounded-2xl border px-4 py-4 transition-colors",
                active
                  ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] ring-2 ring-primary/30"
                  : "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/60",
              )}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button
            key={t.value}
            type="button"
            disabled={disabled}
            onClick={() => {
              onSelect?.(t.value);
            }}
            className={cn(
              "rounded-2xl border px-4 py-4 text-left transition-colors disabled:opacity-50",
              active
                ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] ring-2 ring-primary/30"
                : "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/60",
            )}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
