"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";

import { ResumeCardGridSkeleton } from "@/components/dashboard/resume-card-skeleton";
import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { useDeleteResume, useResumeList } from "@/hooks/use-resumes";
import { ApiError } from "@/lib/api/client";
import { APP_ROUTES } from "@/lib/auth/routes";

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

export function DashboardResumeList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useResumeList(0, 50);
  const deleteMut = useDeleteResume();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = data?.items ?? [];

  const subtitle =
    data != null
      ? `${data.total} ${data.total === 1 ? "resume" : "resumes"}${isFetching ? " · refreshing" : ""}`
      : "Create, edit, and export ATS-ready résumés.";

  return (
    <PageSection
      eyebrow="Library"
      title="Your resumes"
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

        {isError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-4 text-sm"
          >
            <p className="font-medium text-destructive">
              {error instanceof ApiError ? error.message : "Could not load resumes."}
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : null}

        {isLoading ? <ResumeCardGridSkeleton /> : null}

        {!isLoading && !isError && items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Build your first résumé with the guided wizard — edits autosave when you are signed in."
          >
            <Button asChild>
              <Link href={APP_ROUTES.resumeNew}>Create a resume</Link>
            </Button>
          </EmptyState>
        ) : null}

        {!isLoading && !isError && items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((r) => (
              <Card key={r.id} className="glass-panel-lift">
                <CardContent className="flex flex-col gap-4 pt-5">
                  <div className="space-y-1">
                    <h3 className="font-heading text-base font-semibold leading-snug tracking-tight">
                      {r.title || "Untitled"}
                    </h3>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      Updated {formatDate(r.updated_at)} ·{" "}
                      <span className="capitalize">{r.status === "complete" ? "Complete" : "Draft"}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={APP_ROUTES.resumeEdit(r.id)}>Edit</Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={APP_ROUTES.resumePreview(r.id)}>Preview</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={deleteMut.isPending && deletingId === r.id}
                      aria-label={`Delete ${r.title || "resume"}`}
                      onClick={() => {
                        if (!window.confirm("Delete this resume permanently?")) return;
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
    </PageSection>
  );
}
