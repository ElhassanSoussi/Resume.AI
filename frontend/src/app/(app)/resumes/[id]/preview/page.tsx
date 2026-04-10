import type { Metadata } from "next";
import { Suspense } from "react";

import { ResumePreviewLive } from "@/components/resume/resume-preview-live";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Preview · ${id.slice(0, 8)}…` };
}

function PreviewFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="mx-auto h-[min(80vh,720px)] w-full max-w-[720px] rounded-xl" />
    </div>
  );
}

export default async function PreviewResumePage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<PreviewFallback />}>
      <ResumePreviewLive resumeId={id} />
    </Suspense>
  );
}
