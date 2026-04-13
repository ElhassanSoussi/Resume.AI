"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Download,
  FileText,
  ListOrdered,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

import { DashboardWorkspaceOnboarding } from "@/components/dashboard/dashboard-workspace-onboarding";
import { ResumeCardGridSkeleton } from "@/components/dashboard/resume-card-skeleton";
import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { useExportHistory } from "@/hooks/use-billing";
import { useCoverLetterList } from "@/hooks/use-cover-letters";
import { useJobList } from "@/hooks/use-jobs";
import { useDeleteResume, useResumeList } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";
import { getResumeTemplateMeta } from "@/lib/resume/constants";
import {
  hasCompletedWorkspaceOnboarding,
  loadWorkspaceCareerPrefs,
  workflowHintsFromPrefs,
} from "@/lib/onboarding/workspace-preferences";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof FileText;
}) {
  return (
    <Card className="glass-panel border-white/[0.08]">
      <CardContent className="flex items-start justify-between gap-2 px-3 pt-3 pb-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="line-clamp-2 text-[0.7rem] leading-snug text-muted-foreground">{helper}</p>
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
          <Icon className="size-3.5 text-primary" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardResumeList() {
  const [prefEpoch, setPrefEpoch] = useState(0);
  const { data, isLoading, isError, refetch, isFetching } = useResumeList(0, 50);
  const coverLetters = useCoverLetterList(0, 6);
  const jobs = useJobList();
  const exports = useExportHistory(0, 6);
  const deleteMut = useDeleteResume();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;
  const coverLetterCount = coverLetters.data?.total ?? 0;
  const jobCount = jobs.data?.total ?? 0;
  const exportCount = exports.data?.length ?? 0;
  const resumeLabel = total === 1 ? "resume" : "resumes";
  const refreshSuffix = isFetching ? " · refreshing" : "";

  const subtitle =
    data == null
      ? "Build, tailor, cover letter, track, and export — one narrative from first login to first PDF."
      : total === 0
        ? "Create your first resume, then preview, tailor or draft a letter, track applications, and export when the PDF is worth paying for."
        : `${total} ${resumeLabel}${refreshSuffix} — use the checklist and next steps to reach a confident send.`;

  const nextSteps = useMemo(() => {
    void prefEpoch;
    const steps: Array<{ title: string; body: string; href: string; cta: string }> = [];
    const prefs = loadWorkspaceCareerPrefs();
    const hints = workflowHintsFromPrefs(prefs);
    if (total === 0) {
      steps.push({
        title: "Create your first resume",
        body:
          hints[0] && hasCompletedWorkspaceOnboarding()
            ? `Use the guided builder, then refine in the editor. ${hints[0]}`
            : "Use the guided builder for structure, then the editor for depth — preview before you ever think about export.",
        href: APP_ROUTES.resumeNew,
        cta: "Start resume",
      });
    }
    if (total > 0 && coverLetterCount === 0) {
      steps.push({
        title: "Draft a cover letter",
        body: "Same resume + posting text → a structured draft you edit before you send. Tone controls stay in your hands.",
        href: APP_ROUTES.coverLetterNew,
        cta: "New cover letter",
      });
    }
    if (jobCount === 0) {
      steps.push({
        title: "Track applications",
        body: "Company, role, status, dates, posting URL, and notes — enough to follow up without running a CRM.",
        href: APP_ROUTES.jobs,
        cta: "Open tracker",
      });
    }
    if (total > 0 && exportCount === 0) {
      steps.push({
        title: "Unlock PDF export when ready",
        body: "Preview in the app, read export readiness, then pay once per resume in Stripe for ATS or Designed PDFs — regenerate after edits without paying again.",
        href: items[0] ? APP_ROUTES.resumeEdit(items[0].id) : APP_ROUTES.billing,
        cta: "Go to editor & export",
      });
    }
    return steps.slice(0, 3);
  }, [coverLetterCount, exportCount, items, jobCount, prefEpoch, total]);

  const prefsHints = workflowHintsFromPrefs(loadWorkspaceCareerPrefs());

  return (
    <PageSection
      eyebrow="Workspace"
      title="Command center"
      description={subtitle}
      className="space-y-4"
      action={
        <Button asChild className="btn-inset">
          <Link href={APP_ROUTES.resumeNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            New resume
          </Link>
        </Button>
      }
    >
      <div className="space-y-4">
        <DashboardWorkspaceOnboarding onPrefsSaved={() => setPrefEpoch((n) => n + 1)} />
        <ApiTokenCallout />

        {prefsHints.length > 0 ? (
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guidance</p>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[0.72rem] leading-snug text-muted-foreground">
              {prefsHints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {total > 0 && items[0] ? (
          <div className="rounded-lg border border-white/[0.08] bg-card/20 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <ListOrdered className="size-3.5 shrink-0 text-primary" aria-hidden />
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Path to first send
              </p>
            </div>
            <ol className="mt-2 flex flex-col gap-1.5 text-[0.72rem] leading-snug text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1">
              <li className="sm:list-none">
                <span className="tabular-nums text-muted-foreground/80 sm:mr-1">1.</span>
                <Link href={APP_ROUTES.resumeEdit(items[0].id)} className="font-medium text-foreground hover:underline">
                  Finish sections
                </Link>
              </li>
              <li className="sm:list-none">
                <span className="tabular-nums text-muted-foreground/80 sm:mr-1">2.</span>
                <Link href={APP_ROUTES.resumePreview(items[0].id)} className="font-medium text-foreground hover:underline">
                  Preview
                </Link>
              </li>
              <li className="sm:list-none">
                <span className="tabular-nums text-muted-foreground/80 sm:mr-1">3.</span>
                <Link href={APP_ROUTES.resumeTailor(items[0].id)} className="font-medium text-foreground hover:underline">
                  Tailor
                </Link>
                <span className="text-muted-foreground/70"> · </span>
                <Link href={APP_ROUTES.coverLetterNew} className="font-medium text-foreground hover:underline">
                  Letter
                </Link>
              </li>
              <li className="sm:list-none">
                <span className="tabular-nums text-muted-foreground/80 sm:mr-1">4.</span>
                <Link href={APP_ROUTES.jobs} className="font-medium text-foreground hover:underline">
                  Track
                </Link>
              </li>
              <li className="sm:list-none">
                <span className="tabular-nums text-muted-foreground/80 sm:mr-1">5.</span>
                <Link href={APP_ROUTES.resumeEdit(items[0].id)} className="font-medium text-foreground hover:underline">
                  Export
                </Link>
              </li>
            </ol>
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Resumes"
            value={isLoading ? "—" : String(total)}
            helper="Active documents in your workspace"
            icon={FileText}
          />
          <StatCard
            label="Cover letters"
            value={coverLetters.isLoading ? "—" : String(coverLetterCount)}
            helper="Tailored letters ready to review"
            icon={Sparkles}
          />
          <StatCard
            label="Applications"
            value={jobs.isLoading ? "—" : String(jobCount)}
            helper="Tracked roles and interview movement"
            icon={Briefcase}
          />
          <StatCard
            label="Exports"
            value={exports.isLoading ? "—" : String(exportCount)}
            helper="Generated PDFs available to download"
            icon={Download}
          />
        </div>

        {isError ? (
          <Card className="glass-panel border-destructive/30 bg-destructive/10">
            <CardContent className="pt-5">
              <p className="font-medium text-destructive">We couldn’t load your workspace right now.</p>
              <p className="mt-2 text-sm text-destructive/90">
                Refresh to try again. If this keeps happening, confirm the API and database are available.
              </p>
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                Refresh workspace
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Resume library
                </p>
                <p className="mt-0.5 text-[0.78rem] text-muted-foreground">Editor · preview · tailor · versions · export</p>
              </div>
              {items.length > 0 ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={APP_ROUTES.billing}>
                    Billing & exports
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            {isLoading ? <ResumeCardGridSkeleton /> : null}

            {!isLoading && !isError && items.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Start with one resume"
                description="The guided builder sets structure in minutes. Then you will use the same workspace for preview, AI tuning, tailoring, cover letters, the job tracker, and PDF export when you are ready to pay once for that file."
              >
                <Button asChild>
                  <Link href={APP_ROUTES.resumeNew}>Create a resume</Link>
                </Button>
              </EmptyState>
            ) : null}

            {!isLoading && !isError && items.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((r) => (
                  <Card key={r.id} className="glass-panel-lift border-white/[0.08]">
                    <CardContent className="space-y-2.5 px-3.5 pt-3.5 pb-3.5">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-heading text-[0.95rem] font-semibold leading-snug tracking-tight">
                              {r.title || "Untitled"}
                            </h3>
                            <p className="mt-0.5 text-[0.78rem] text-muted-foreground">
                              {getResumeTemplateMeta(r.template_key).label}
                            </p>
                          </div>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            {r.status === "complete" ? "Complete" : "Draft"}
                          </span>
                        </div>
                        <p className="text-[0.72rem] tabular-nums text-muted-foreground">
                          Updated {formatDate(r.updated_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button variant="default" size="sm" asChild>
                          <Link href={APP_ROUTES.resumeEdit(r.id)}>Open editor</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={APP_ROUTES.resumePreview(r.id)}>Preview</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={APP_ROUTES.resumeTailor(r.id)}>Tailor</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={APP_ROUTES.resumeVersions(r.id)}>Versions</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={deleteMut.isPending && deletingId === r.id}
                          aria-label={`Delete ${r.title || "resume"}`}
                          onClick={() => {
                            if (!globalThis.window.confirm("Delete this resume permanently?")) return;
                            setDeletingId(r.id);
                            deleteMut.mutate(r.id, {
                              onSettled: () => setDeletingId(null),
                            });
                          }}
                        >
                          {deleteMut.isPending && deletingId === r.id ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="size-4" aria-hidden />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <Card className="glass-panel border-white/[0.08]">
              <CardHeader className="space-y-0 px-3.5 pt-3.5 pb-2">
                <CardTitle className="text-[0.85rem]">Next & activity</CardTitle>
                <CardDescription className="text-[0.72rem] leading-snug">
                  Suggested moves and recent PDFs.
                </CardDescription>
              </CardHeader>
              <CardContent className="divide-y divide-white/10 px-3.5 pb-3.5">
                <div className="space-y-2 pb-3">
                  {nextSteps.length === 0 ? (
                    <p className="text-[0.72rem] text-muted-foreground">No queued suggestions — you are covering the bases.</p>
                  ) : (
                    nextSteps.map((step) => (
                      <div key={step.title} className="rounded-md border border-white/8 bg-white/[0.02] px-2.5 py-2">
                        <p className="text-[0.78rem] font-medium text-foreground">{step.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[0.7rem] leading-snug text-muted-foreground">{step.body}</p>
                        <Button asChild variant="link" size="sm" className="mt-1 h-auto px-0 py-0 text-[0.72rem]">
                          <Link href={step.href}>
                            {step.cta}
                            <ArrowRight className="ml-1 size-3" />
                          </Link>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-2 pt-3">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent exports</p>
                  {exports.data?.map((item) => (
                    <div key={item.id} className="flex flex-col gap-0.5 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <p className="text-[0.78rem] font-medium text-foreground">{item.resume_title}</p>
                      <p className="text-[0.68rem] text-muted-foreground">{getResumeTemplateMeta(item.template_key).label}</p>
                      <p className="text-[0.65rem] tabular-nums text-muted-foreground/90">{formatDate(item.created_at)}</p>
                    </div>
                  )) ?? null}
                  {!exports.isLoading && (exports.data?.length ?? 0) === 0 ? (
                    <p className="text-[0.72rem] text-muted-foreground">No exports yet.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
