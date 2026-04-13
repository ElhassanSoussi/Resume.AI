"use client";

import { Loader2 } from "lucide-react";

import { ResumeVersionList } from "@/components/resume/resume-version-list";
import { useResume } from "@/hooks/use-resumes";

export function ResumeVersionsPage({ resumeId }: { resumeId: string }) {
  const { data: resume, isLoading } = useResume(resumeId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!resume) {
    return <p className="text-sm text-muted-foreground">Resume not found.</p>;
  }

  return <ResumeVersionList resumeId={resumeId} resumeTitle={resume.title} />;
}
