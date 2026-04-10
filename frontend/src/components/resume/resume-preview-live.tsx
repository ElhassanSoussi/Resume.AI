"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ResumePreviewDocument } from "@/components/resume/resume-preview-document";
import { TemplatePicker } from "@/components/resume/template-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResume } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";
import { normalizePreviewTemplateKey, type PreviewTemplateId } from "@/lib/resume/constants";

type Props = { resumeId: string };

export function ResumePreviewLive({ resumeId }: Props) {
  const { data, isLoading, isError, error } = useResume(resumeId);
  const searchParams = useSearchParams();
  const qTemplate = searchParams.get("template");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="mx-auto h-[720px] w-full max-w-[720px] rounded-sm" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load resume."}
      </div>
    );
  }

  const template: PreviewTemplateId = normalizePreviewTemplateKey(qTemplate ?? data.template_key);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Live preview · updates when you save from the editor.
          </p>
          <p className="mt-1 font-heading text-lg font-semibold text-foreground">{data.title}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={APP_ROUTES.resumeEdit(resumeId)}>Edit resume</Link>
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Template</p>
        <TemplatePicker
          resumeId={resumeId}
          selected={template}
          variant="preview"
        />
      </section>

      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,oklch(0.35_0.08_260/0.35),transparent)] p-6 md:p-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative">
          <ResumePreviewDocument resume={data} template={template} />
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        This preview is for layout only — export uses the same content with your chosen PDF template.
      </p>
    </div>
  );
}
