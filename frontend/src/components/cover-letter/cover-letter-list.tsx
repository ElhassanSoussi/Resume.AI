"use client";

import Link from "next/link";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSection } from "@/components/ui/page-section";
import { useDeleteCoverLetter, useCoverLetterList } from "@/hooks/use-cover-letters";
import { APP_ROUTES } from "@/lib/auth/routes";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CoverLetterList() {
  const { data, isLoading, isError, error } = useCoverLetterList(0, 50);
  const del = useDeleteCoverLetter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <PageSection
      eyebrow="Writing"
      title="Cover letters"
      description={data == null ? "Generate tailored cover letters with AI." : `${total} letter${total === 1 ? "" : "s"}`}
      action={
        <Button asChild className="btn-inset">
          <Link href={APP_ROUTES.coverLetterNew}>
            <Plus className="mr-2 size-4" />
            New cover letter
          </Link>
        </Button>
      }
    >
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load cover letters."}
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No cover letters yet"
          description="Generate a personalised cover letter for any job in seconds."
        >
          <Button asChild>
            <Link href={APP_ROUTES.coverLetterNew}>Create a cover letter</Link>
          </Button>
        </EmptyState>
      )}

      {!isLoading && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((cl) => (
            <Card key={cl.id} className="glass-panel-lift">
              <CardContent className="flex flex-col gap-4 pt-5">
                <div className="space-y-1">
                  <h3 className="font-heading text-base font-semibold leading-snug">
                    {cl.title}
                  </h3>
                  {(cl.company_name || cl.target_role) && (
                    <p className="text-xs text-muted-foreground">
                      {[cl.target_role, cl.company_name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs tabular-nums text-muted-foreground">
                    Updated {formatDate(cl.updated_at)} ·{" "}
                    <span className="capitalize">{cl.status}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={APP_ROUTES.coverLetterDetail(cl.id)}>Edit</Link>
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
      )}
    </PageSection>
  );
}
