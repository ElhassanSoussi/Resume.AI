"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  PREVIEW_TEMPLATES,
  type PreviewTemplateId,
} from "@/lib/resume/constants";
import { APP_ROUTES } from "@/lib/auth/routes";

type Props = {
  selected: PreviewTemplateId;
  /** When set, preview mode links with ?template= */
  resumeId?: string;
  /** `preview` = URL + Link; `editor` = visual only + callback */
  variant: "preview" | "editor";
  onSelect?: (value: PreviewTemplateId) => void;
  disabled?: boolean;
};

export function TemplatePicker({ selected, resumeId, variant, onSelect, disabled }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {PREVIEW_TEMPLATES.map((t) => {
        const active = selected === t.value;
        const inner = (
          <span className="flex flex-col gap-1 text-left">
            <span className="font-heading text-sm font-semibold">{t.label}</span>
            <span className="text-xs leading-snug text-muted-foreground">{t.description}</span>
          </span>
        );

        if (variant === "preview" && resumeId) {
          const href = `${APP_ROUTES.resumePreview(resumeId)}?template=${encodeURIComponent(t.value)}`;
          return (
            <Link
              key={t.value}
              href={href}
              scroll={false}
              className={cn(
                "rounded-xl border px-4 py-3 transition-colors",
                active
                  ? "border-primary/70 bg-primary/10 ring-2 ring-primary/30"
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
              "rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50",
              active
                ? "border-primary/70 bg-primary/10 ring-2 ring-primary/30"
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
