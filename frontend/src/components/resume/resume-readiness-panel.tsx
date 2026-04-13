"use client";

import Link from "next/link";
import { CheckCircle2, CircleAlert, CircleDot } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/routes";
import { cn } from "@/lib/utils";
import { analyzeResumeReadiness } from "@/lib/resume/readiness";
import type { ResumeExportMode } from "@/lib/resume/constants";
import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

type Props = {
  resumeId: string;
  values: ResumeFullUpdateFormValues;
  /** When set, highlights export recommendation for that mode (e.g. editor vs preview). */
  activeExportMode?: ResumeExportMode;
  /** Dense layout for preview studio rail — less chrome, accordion-style sections. */
  compact?: boolean;
  /** Hide bottom quick links when the parent surface already exposes those actions. */
  hideFooterActions?: boolean;
};

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") return <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" aria-hidden />;
  if (status === "fail") return <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-red-400/90" aria-hidden />;
  return <CircleDot className="mt-0.5 size-3.5 shrink-0 text-amber-300" aria-hidden />;
}

export function ResumeReadinessPanel({
  resumeId,
  values,
  activeExportMode,
  compact,
  hideFooterActions,
}: Props) {
  const report = analyzeResumeReadiness(values);
  const { exportHint } = report;

  const body = (
    <>
      <div className={cn("rounded-lg border border-white/10 bg-white/[0.03]", compact ? "p-2.5" : "p-3")}>
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">Suggested export</p>
        <p className={cn("font-medium text-foreground", compact ? "mt-1 text-[0.8rem]" : "mt-1.5 text-sm")}>
          {exportHint.recommendMode === "ats" ? "ATS Export" : "Designed Export"}
          {activeExportMode && activeExportMode === exportHint.recommendMode ? (
            <span className="ml-1.5 text-[0.65rem] font-normal text-emerald-400/90">Matches preview</span>
          ) : null}
        </p>
        <p className={cn("text-muted-foreground", compact ? "mt-1 text-[0.68rem] leading-snug" : "mt-1 text-xs leading-relaxed")}>
          {exportHint.reason}
        </p>
        {!compact ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">Also consider:</span>{" "}
            {exportHint.alternateMode === "ats" ? "ATS Export" : "Designed Export"} — {exportHint.alternateReason}
          </p>
        ) : (
          <p className="mt-1.5 text-[0.65rem] leading-snug text-muted-foreground/90">
            Alt: {exportHint.alternateMode === "ats" ? "ATS" : "Designed"} — {exportHint.alternateReason}
          </p>
        )}
      </div>

      {report.nextActions.length > 0 ? (
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">Improve next</p>
          <ul
            className={cn(
              "mt-1.5 list-inside list-disc text-muted-foreground",
              compact ? "space-y-0.5 text-[0.68rem] leading-snug" : "mt-2 space-y-1 text-xs leading-relaxed",
            )}
          >
            {report.nextActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p
          className={cn(
            "text-emerald-200/80",
            compact ? "text-[0.68rem] leading-snug" : "text-xs leading-relaxed",
          )}
        >
          Core sections look complete enough to export. Skim preview before you send.
        </p>
      )}

      {compact ? (
        <div className="space-y-1">
          {report.categories.map((cat) => (
            <details
              key={cat.id}
              className="group rounded-md border border-white/8 bg-white/[0.02] open:bg-white/[0.04]"
            >
              <summary className="cursor-pointer list-none px-2.5 py-2 text-[0.72rem] font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  {cat.title}
                  <span className="text-[0.65rem] font-normal text-muted-foreground">{cat.items.length} checks</span>
                </span>
              </summary>
              <ul className="space-y-1.5 border-t border-white/8 px-2.5 py-2">
                {cat.items.map((item) => (
                  <li key={item.id} className="flex gap-2 text-[0.68rem] leading-snug text-muted-foreground">
                    <StatusIcon status={item.status} />
                    <span>
                      <span className="text-foreground/90">{item.label}</span>
                      {item.detail ? <span className="mt-0.5 block text-[0.65rem] opacity-90">{item.detail}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {report.categories.map((cat) => (
            <div key={cat.id} className="rounded-lg border border-white/8 bg-white/[0.02] p-3">
              <p className="text-[0.72rem] font-semibold text-foreground">{cat.title}</p>
              <ul className="mt-2 space-y-2">
                {cat.items.map((item) => (
                  <li key={item.id} className="flex gap-2 text-[0.72rem] leading-snug text-muted-foreground">
                    <StatusIcon status={item.status} />
                    <span>
                      <span className="text-foreground/90">{item.label}</span>
                      {item.detail ? <span className="mt-0.5 block text-[0.68rem] opacity-90">{item.detail}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!hideFooterActions ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={APP_ROUTES.resumePreview(resumeId)}>Open preview</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={APP_ROUTES.resumeTailor(resumeId)}>Tailor for a role</Link>
          </Button>
        </div>
      ) : null}
    </>
  );

  if (compact) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Readiness</p>
        <div className="mt-2 space-y-3">{body}</div>
      </div>
    );
  }

  return (
    <Card className="glass-panel border-white/[0.08]">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-sm font-semibold">Export readiness</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          Checklist-style review — not a score. Use it to decide when you are comfortable exporting and which mode fits
          the destination.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{body}</CardContent>
    </Card>
  );
}
