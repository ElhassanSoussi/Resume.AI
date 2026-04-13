"use client";

import { Loader2 } from "lucide-react";

import { CoverLetterBuilder } from "@/components/cover-letter/cover-letter-builder";
import { useResumeList } from "@/hooks/use-resumes";

export function CoverLetterNewPage() {
  const { data, isLoading } = useResumeList(0, 100);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <CoverLetterBuilder resumes={data?.items ?? []} />;
}
