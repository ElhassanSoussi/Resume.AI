"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_ROUTES } from "@/lib/auth/routes";
import { analyzeResumeCoaching } from "@/lib/resume/coaching";
import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

type Props = {
  resumeId: string;
  values: ResumeFullUpdateFormValues;
};

export function ResumeCoachPanel({ resumeId, values }: Props) {
  const coach = analyzeResumeCoaching(values);

  return (
    <Card className="glass-panel border-white/[0.08]">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          Resume coach
        </CardTitle>
        <CardDescription>
          Narrative coaching alongside the checklist-style export readiness card — use both before you tailor, preview,
          and export.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(240px,0.72fr)]">
        <div className="space-y-3">
          <div>
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Improve next</p>
            <div className="mt-2 space-y-2">
              {coach.signals.length ? (
                coach.signals.map((signal) => (
                  <div key={`${signal.section}-${signal.title}`} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-start gap-2.5">
                      <TriangleAlert className="mt-0.5 size-3.5 text-amber-300" />
                      <div>
                        <p className="text-[0.82rem] font-medium text-foreground">{signal.title}</p>
                        <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">{signal.detail}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-300" />
                    <div>
                      <p className="text-[0.82rem] font-medium text-foreground">Structure is strong</p>
                      <p className="mt-0.5 text-[0.76rem] leading-relaxed text-muted-foreground">
                        Ready for tailoring, preview, and export.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {coach.strengths.length ? (
            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Already strong</p>
              <div className="mt-2 space-y-2">
                {coach.strengths.map((strength) => (
                  <div key={strength} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 text-emerald-300" />
                      <p className="text-[0.76rem] leading-relaxed text-muted-foreground">{strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.resumeTailor(resumeId)}>Tailor for a role</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.resumePreview(resumeId)}>Preview ATS vs Designed</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.coverLetterNew}>Cover letter</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={APP_ROUTES.jobs}>
                  Track application
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Guidance</p>
            <p className="mt-1.5 text-[0.76rem] leading-relaxed text-muted-foreground">
              Strong resumes feel specific and easy to skim. Use AI to sharpen language, then review before exporting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
