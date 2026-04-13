"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  RESUME_TEMPLATE_FAMILY_ORDER,
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
  /** Comfortable = editor / wizard; compact = studio rail. */
  density?: "comfortable" | "compact";
  /** Override grid columns (Tailwind classes after `grid`). */
  gridClassName?: string;
  className?: string;
};

export function TemplatePicker({
  selected,
  resumeId,
  variant,
  onSelect,
  disabled,
  previewMode,
  density = "comfortable",
  gridClassName,
  className,
}: Props) {
  type FamilyTab = (typeof RESUME_TEMPLATE_FAMILY_ORDER)[number];

  const families = useMemo(() => {
    const present = new Set(RESUME_TEMPLATE_LIBRARY.map((t) => t.family));
    return RESUME_TEMPLATE_FAMILY_ORDER.filter((f) => present.has(f));
  }, []);

  const [family, setFamily] = useState<FamilyTab>(() => {
    const sel = RESUME_TEMPLATE_LIBRARY.find((t) => t.value === selected);
    if (sel && families.includes(sel.family as FamilyTab)) return sel.family as FamilyTab;
    return families[0] ?? "Professional";
  });

  useEffect(() => {
    const meta = RESUME_TEMPLATE_LIBRARY.find((t) => t.value === selected);
    if (meta && families.includes(meta.family as FamilyTab)) setFamily(meta.family as FamilyTab);
  }, [selected, families]);

  const filtered = useMemo(
    () => RESUME_TEMPLATE_LIBRARY.filter((t) => t.family === family),
    [family],
  );

  const grid =
    gridClassName ??
    (density === "compact" ? "grid grid-cols-1 gap-1.5" : "grid gap-2 sm:grid-cols-2 xl:grid-cols-3");

  const cardBase =
    density === "compact"
      ? "rounded-lg border px-2.5 py-2 text-left transition-colors"
      : "rounded-xl border px-3 py-2.5 text-left transition-colors";
  const cardActive = "border-primary/60 bg-primary/10 ring-1 ring-primary/25";
  const cardIdle = "border-white/10 bg-card/40 hover:border-white/20 hover:bg-card/60";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 flex flex-wrap gap-1" role="tablist" aria-label="Template category">
        {families.map((f) => {
          const active = family === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFamily(f)}
              className={cn(
                "rounded-md border px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-transparent bg-white/[0.03] text-muted-foreground hover:border-white/15 hover:text-foreground",
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      <div className={cn(grid)}>
        {filtered.map((t) => {
          const active = selected === t.value;
          const inner =
            density === "compact" ? (
              <span className="flex items-start gap-2">
                <span
                  className={cn(
                    "mt-0.5 size-2 shrink-0 rounded-full ring-1 ring-offset-1 ring-offset-transparent",
                    t.atsSafe ? "bg-emerald-400/90 ring-emerald-500/40" : "bg-slate-500/50 ring-white/10",
                  )}
                  title={t.atsSafe ? "ATS-oriented template" : "Designed layout"}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[0.78rem] font-semibold leading-tight">{t.label}</span>
                    {t.atsSafe ? (
                      <span className="shrink-0 rounded border border-emerald-500/30 px-1 py-px text-[0.55rem] font-semibold uppercase tracking-wide text-emerald-300/95">
                        ATS
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block line-clamp-1 text-[0.65rem] text-muted-foreground" title={t.bestFor}>
                    {t.bestFor}
                  </span>
                </span>
              </span>
            ) : (
              <span className="flex flex-col gap-1 text-left" title={t.description}>
                <span className="flex items-start justify-between gap-2">
                  <span className="text-[0.8rem] font-semibold leading-snug">{t.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {t.atsSafe ? (
                      <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-1 py-px text-[0.55rem] font-semibold uppercase tracking-wide text-emerald-300">
                        ATS
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="line-clamp-1 text-[0.68rem] text-muted-foreground">{t.tone}</span>
                <span className="line-clamp-2 text-[0.68rem] text-muted-foreground/90">{t.bestFor}</span>
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
                className={cn(cardBase, active ? cardActive : cardIdle)}
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
              onClick={() => onSelect?.(t.value)}
              className={cn(cardBase, "disabled:opacity-50", active ? cardActive : cardIdle)}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}
