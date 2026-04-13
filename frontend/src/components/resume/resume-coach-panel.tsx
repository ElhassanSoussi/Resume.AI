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
          Practical guidance to strengthen the draft before you tailor, preview, export, and apply.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-4">
          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Improve next</p>
            <div className="mt-3 space-y-3">
              {coach.signals.length ? (
                coach.signals.map((signal) => (
                  <div key={`${signal.section}-${signal.title}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <TriangleAlert className="mt-0.5 size-4 text-amber-300" />
                      <div>
                        <p className="font-medium text-foreground">{signal.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{signal.detail}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                    <div>
                      <p className="font-medium text-foreground">The structure is in a strong place</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        This draft looks ready for role tailoring, preview review, and export checks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {coach.strengths.length ? (
            <div>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Already strong</p>
              <div className="mt-3 space-y-3">
                {coach.strengths.map((strength) => (
                  <div key={strength} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 text-emerald-300" />
                      <p className="text-sm leading-relaxed text-muted-foreground">{strength}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
            <div className="mt-3 flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.resumeTailor(resumeId)}>Tailor for a live role</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.resumePreview(resumeId)}>Review ATS vs Designed</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.coverLetterNew}>Generate a cover letter</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={APP_ROUTES.jobs}>
                  Track the application
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Editing guidance</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Strong resumes usually feel specific, restrained, and easy to skim. Use AI to sharpen language, then apply your own judgment before exporting.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
