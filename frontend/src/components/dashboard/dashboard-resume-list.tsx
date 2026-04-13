"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Download,
  FileText,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

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
    <Card className="glass-panel-lift border-white/[0.08]">
      <CardContent className="flex items-start justify-between gap-4 pt-5">
        <div className="space-y-1">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{helper}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="size-5 text-primary" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardResumeList() {
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

  const subtitle = data == null
    ? "A premium workspace for resumes, exports, applications, and tailored outreach."
    : `${total} ${resumeLabel}${refreshSuffix}`;

  const nextSteps = useMemo(() => {
    const steps: Array<{ title: string; body: string; href: string; cta: string }> = [];
    if (total === 0) {
      steps.push({
        title: "Create your first resume",
        body: "Start with the guided builder, then refine in the editor once the structure is in place.",
        href: APP_ROUTES.resumeNew,
        cta: "Start resume",
      });
    }
    if (total > 0 && coverLetterCount === 0) {
      steps.push({
        title: "Draft a cover letter",
        body: "Use your existing resume to generate tailored outreach for a live role.",
        href: APP_ROUTES.coverLetterNew,
        cta: "New cover letter",
      });
    }
    if (jobCount === 0) {
      steps.push({
        title: "Track live applications",
        body: "Keep application status, notes, and momentum in one place as interviews progress.",
        href: APP_ROUTES.jobs,
        cta: "Open tracker",
      });
    }
    if (total > 0 && exportCount === 0) {
      steps.push({
        title: "Export a recruiter-ready PDF",
        body: "Preview your document, choose ATS or Designed Export, and generate the final version when you are ready.",
        href: items[0] ? APP_ROUTES.resumeEdit(items[0].id) : APP_ROUTES.billing,
        cta: "Review exports",
      });
    }
    return steps.slice(0, 3);
  }, [coverLetterCount, exportCount, items, jobCount, total]);

  return (
    <PageSection
      eyebrow="Workspace"
      title="Command center"
      description={subtitle}
      action={
        <Button asChild className="btn-inset">
          <Link href={APP_ROUTES.resumeNew}>
            <Plus className="mr-2 size-4" aria-hidden />
            New resume
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <ApiTokenCallout />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Resume library
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Edit, preview, tailor, and export from one place.
                </p>
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
                title="Your workspace is ready"
                description="Create your first resume to unlock previews, exports, tailored cover letters, and application tracking."
              >
                <Button asChild>
                  <Link href={APP_ROUTES.resumeNew}>Create a resume</Link>
                </Button>
              </EmptyState>
            ) : null}

            {!isLoading && !isError && items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((r) => (
                  <Card key={r.id} className="glass-panel-lift border-white/[0.08]">
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-heading text-lg font-semibold leading-snug tracking-tight">
                              {r.title || "Untitled"}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {getResumeTemplateMeta(r.template_key).label}
                            </p>
                          </div>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            {r.status === "complete" ? "Complete" : "Draft"}
                          </span>
                        </div>
                        <p className="text-xs tabular-nums text-muted-foreground">
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

          <div className="space-y-4">
            <Card className="glass-panel border-white/[0.08]">
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
                <CardDescription>Suggested actions to keep your job-search workflow moving.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nextSteps.length === 0 ? (
                  <EmptyState
                    title="Everything is in motion"
                    description="Your workspace already has resumes, supporting docs, and activity. Keep refining and exporting as roles progress."
                    className="px-4 py-8"
                  />
                ) : (
                  nextSteps.map((step) => (
                    <div key={step.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                      <Button asChild variant="ghost" size="sm" className="mt-3">
                        <Link href={step.href}>
                          {step.cta}
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/[0.08]">
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Latest exports, applications, and letter work across your workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {exports.data?.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="font-medium text-foreground">{item.resume_title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Exported with {getResumeTemplateMeta(item.template_key).label}
                    </p>
                    <p className="mt-2 text-xs tabular-nums text-muted-foreground">{formatDate(item.created_at)}</p>
                  </div>
                )) ?? null}

                {!exports.isLoading && (exports.data?.length ?? 0) === 0 ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    No recent exports yet. Once you generate PDFs, activity will show up here for quick reference.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
