"use client";

import { Loader2 } from "lucide-react";

import { CoverLetterBuilder } from "@/components/cover-letter/cover-letter-builder";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCoverLetter } from "@/hooks/use-cover-letters";
import { useResumeList } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";

export function CoverLetterDetailPage({ id }: { id: string }) {
  const { data: letter, isLoading: letterLoading, isError: letterError } = useCoverLetter(id);
  const { data: resumeData, isLoading: resumesLoading, isError: resumeError } = useResumeList(0, 100);

  if (letterLoading || resumesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (letterError || resumeError || !letter) {
    return (
      <EmptyState
        title="Cover letter unavailable"
        description="We couldn’t load this draft right now. Refresh the page or return to the cover letter library."
      >
        <Button asChild>
          <a href={APP_ROUTES.coverLetters}>Back to cover letters</a>
        </Button>
      </EmptyState>
    );
  }

  return <CoverLetterBuilder resumes={resumeData?.items ?? []} initial={letter} />;
}
