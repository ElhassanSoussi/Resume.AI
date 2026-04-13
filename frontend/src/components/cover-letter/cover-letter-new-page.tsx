"use client";

import { Loader2 } from "lucide-react";

import { CoverLetterBuilder } from "@/components/cover-letter/cover-letter-builder";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useResumeList } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";

export function CoverLetterNewPage() {
  const { data, isLoading, isError } = useResumeList(0, 100);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Resume library unavailable"
        description="We need your resume list before we can start a cover letter draft."
      >
        <Button asChild>
          <a href={APP_ROUTES.coverLetters}>Back to cover letters</a>
        </Button>
      </EmptyState>
    );
  }

  return <CoverLetterBuilder resumes={data?.items ?? []} />;
}
