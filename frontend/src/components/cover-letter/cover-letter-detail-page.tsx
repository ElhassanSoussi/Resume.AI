"use client";

import { Loader2 } from "lucide-react";

import { CoverLetterBuilder } from "@/components/cover-letter/cover-letter-builder";
import { useCoverLetter } from "@/hooks/use-cover-letters";
import { useResumeList } from "@/hooks/use-resumes";

export function CoverLetterDetailPage({ id }: { id: string }) {
  const { data: letter, isLoading: letterLoading } = useCoverLetter(id);
  const { data: resumeData, isLoading: resumesLoading } = useResumeList(0, 100);

  if (letterLoading || resumesLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!letter) {
    return <p className="text-sm text-muted-foreground">Cover letter not found.</p>;
  }

  return <CoverLetterBuilder resumes={resumeData?.items ?? []} initial={letter} />;
}
