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
      className="space-y-4"
      action={
        <Button asChild className="btn-inset">
          <Link href={APP_ROUTES.coverLetterNew}>
            <Plus className="mr-2 size-4" />
            New cover letter
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
        <Card className="glass-panel border-white/[0.08]">
          <CardHeader className="space-y-1 px-4 pt-4 pb-2">
            <CardTitle className="text-base">Library</CardTitle>
            <CardDescription className="text-[0.78rem]">Drafts per role or company — refine before you send.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
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
              <div className="divide-y divide-white/10 rounded-lg border border-white/8">
                {items.map((cl) => (
                  <div key={cl.id} className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-heading text-[0.95rem] font-semibold leading-snug">{cl.title}</h3>
                        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          {cl.status}
                        </span>
                      </div>
                      <p className="text-[0.78rem] text-muted-foreground">
                        {[cl.target_role, cl.company_name].filter(Boolean).join(" · ") || "General draft"}
                      </p>
                      <p className="text-[0.68rem] tabular-nums text-muted-foreground">Updated {formatDate(cl.updated_at)}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
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
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <aside className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3 xl:sticky xl:top-20 xl:self-start">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workflow</p>
          <ul className="space-y-2 text-[0.72rem] leading-snug text-muted-foreground">
            <li>
              <span className="font-medium text-foreground/90">Resume first</span> — pick the version that matches the role.
            </li>
            <li>
              <span className="font-medium text-foreground/90">Draft → refine</span> — AI opens; you close with specifics.
            </li>
            <li className="text-muted-foreground/95">
              {draftCount} draft{draftCount === 1 ? "" : "s"} in review.
            </li>
          </ul>
          <Button asChild variant="outline" size="sm" className="h-8 w-full text-xs">
            <Link href={APP_ROUTES.coverLetterNew}>
              <Sparkles className="mr-1.5 size-3.5" />
              New draft
            </Link>
          </Button>
        </aside>
      </div>
    </PageSection>
  );
}
