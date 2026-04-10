import type { Metadata } from "next";

import { ResumeEditorForm } from "@/components/resume/resume-editor-form";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit · ${id.slice(0, 8)}…` };
}

export default async function EditResumePage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Editing resume <span className="font-mono text-foreground">{id}</span>
        </p>
      </div>
      <div className="glass-panel rounded-xl border border-white/10 p-6">
        <ResumeEditorForm resumeId={id} />
      </div>
    </div>
  );
}
