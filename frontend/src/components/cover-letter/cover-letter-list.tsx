"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

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
import { useDeleteCoverLetter, useCoverLetterList } from "@/hooks/use-cover-letters";
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

export function CoverLetterList() {
  const { data, isLoading, isError, refetch, isFetching } = useCoverLetterList(0, 50);
  const del = useDeleteCoverLetter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const draftCount = items.filter((item) => item.status === "draft").length;

  return (
    <PageSection
      eyebrow="Writing"
      title="Cover letters"
      description={
        data == null
          ? "Generate tailored letters from your resume, then refine them before you send."
          : `${total} letter${total === 1 ? "" : "s"}${isFetching ? " · refreshing" : ""}`
      }
      action={
        <Button asChild className="btn-inset">
          <Link href={APP_ROUTES.coverLetterNew}>
            <Plus className="mr-2 size-4" />
            New cover letter
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Letter library</CardTitle>
              <CardDescription>
                Save polished drafts per role, company, or outreach scenario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex h-36 items-center justify-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : null}

              {isError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
                  <p className="font-medium text-destructive">We couldn’t load your cover letters right now.</p>
                  <p className="mt-2 text-sm text-destructive/90">
                    Refresh to try again. If this is your first visit, confirm your database schema is up to date.
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                    Refresh cover letters
                  </Button>
                </div>
              ) : null}

              {!isLoading && !isError && items.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No cover letters yet"
                  description="Generate a tailored first draft from one of your resumes, then revise tone and detail before you send it."
                >
                  <Button asChild>
                    <Link href={APP_ROUTES.coverLetterNew}>Create a cover letter</Link>
                  </Button>
                </EmptyState>
              ) : null}

              {!isLoading && !isError && items.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((cl) => (
                    <Card key={cl.id} className="glass-panel-lift border-white/[0.08]">
                      <CardContent className="space-y-4 pt-5">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-heading text-lg font-semibold leading-snug">{cl.title}</h3>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {[cl.target_role, cl.company_name].filter(Boolean).join(" · ") || "General draft"}
                              </p>
                            </div>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                              {cl.status}
                            </span>
                          </div>
                          <p className="text-xs tabular-nums text-muted-foreground">
                            Updated {formatDate(cl.updated_at)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button variant="default" size="sm" asChild>
                            <Link href={APP_ROUTES.coverLetterDetail(cl.id)}>Open draft</Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={del.isPending && deletingId === cl.id}
                            onClick={() => {
                              if (!globalThis.window.confirm("Delete this cover letter?")) return;
                              setDeletingId(cl.id);
                              del.mutate(cl.id, { onSettled: () => setDeletingId(null) });
                            }}
                          >
                            {del.isPending && deletingId === cl.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/[0.08]">
            <CardHeader>
              <CardTitle>Workflow</CardTitle>
              <CardDescription>Use the same draft workflow for every application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Start from a resume</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick the resume version that best matches the role before generating.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Generate, then refine</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI gets you to a strong first draft. Final edits should still reflect your voice and specifics.
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="font-medium text-foreground">Current draft count</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {draftCount} draft{draftCount === 1 ? "" : "s"} ready for review.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={APP_ROUTES.coverLetterNew}>
                  <Sparkles className="mr-2 size-4" />
                  Start a new draft
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageSection>
  );
}
