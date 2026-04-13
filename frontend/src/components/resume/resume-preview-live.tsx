"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Maximize2, ScanSearch, Wand2 } from "lucide-react";

import { ExportModePicker } from "@/components/resume/export-mode-picker";
import { ResumePreviewDocument } from "@/components/resume/resume-preview-document";
import { TemplatePicker } from "@/components/resume/template-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResume } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";
import {
  getResumeTemplateMeta,
  normalizeResumeExportMode,
  normalizeResumeTemplateKey,
  resolvePreviewTemplate,
} from "@/lib/resume/constants";

type Props = { resumeId: string };

const ZOOM_PRESETS = [
  { value: "fit", label: "Fit" },
  { value: 0.9, label: "90%" },
  { value: 1, label: "100%" },
  { value: 1.08, label: "108%" },
] as const;

export function ResumePreviewLive({ resumeId }: Props) {
  const { data, isLoading, isError } = useResume(resumeId);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryTemplate = searchParams.get("template");
  const queryMode = searchParams.get("mode");
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(0.92);
  const [zoomPreset, setZoomPreset] = useState<(typeof ZOOM_PRESETS)[number]["value"]>("fit");

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const updateScale = () => {
      const availableWidth = node.clientWidth - 72;
      const computed = availableWidth / 980;
      setFitScale(Math.max(0.82, Math.min(0.92, computed)));
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="mx-auto h-[960px] w-full max-w-[980px] rounded-[28px]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        We couldn’t load this preview right now. Return to the editor and try again in a moment.
      </div>
    );
  }

  const selectedMode = normalizeResumeExportMode(queryMode);
  const designedTemplate = normalizeResumeTemplateKey(queryTemplate ?? data.template_key);
  const previewTemplate = resolvePreviewTemplate(designedTemplate, selectedMode);
  const previewTemplateMeta = getResumeTemplateMeta(previewTemplate);
  const designedTemplateMeta = getResumeTemplateMeta(designedTemplate);
  const activeScale = zoomPreset === "fit" ? fitScale : zoomPreset;

  const updateMode = (mode: "ats" | "designed") => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", mode);
    if (!next.get("template")) next.set("template", designedTemplate);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Document Preview</p>
          <p className="font-heading text-2xl font-semibold text-foreground">{data.title}</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            White-paper preview with print margins, document-safe contrast, and export-specific layout rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={APP_ROUTES.resumeEdit(resumeId)}>Edit resume</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={APP_ROUTES.resumeTailor(resumeId)}>Tailor for role</Link>
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Export mode</p>
          <p className="text-sm text-muted-foreground">
            ATS Export always uses ATS Classic. Designed Export uses your selected premium template.
          </p>
        </div>
        <ExportModePicker selected={selectedMode} onSelect={updateMode} compact />
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Designed template</p>
          <p className="text-sm text-muted-foreground">
            {selectedMode === "ats"
              ? `Designed Export is currently set to ${designedTemplateMeta.label}. Switch back to Designed Export to preview it.`
              : `${previewTemplateMeta.label} is active in the document preview below.`}
          </p>
        </div>
        <TemplatePicker
          resumeId={resumeId}
          selected={designedTemplate}
          variant="preview"
          disabled={selectedMode === "ats"}
          previewMode={selectedMode}
        />
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#0a1019] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 text-sm text-slate-300 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="font-heading text-base font-semibold text-white">A4 document frame</p>
            <p className="mt-1 text-sm text-slate-400">
              Centered white paper, calmer viewing distance, and print-safe contrast against the dark app shell.
            </p>
          </div>
          <div className="flex flex-col gap-3 xl:items-end">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {selectedMode === "ats" ? "ATS Preview" : "Designed Preview"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                {previewTemplateMeta.label}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-400">
                <Maximize2 className="size-3.5" />
                Scale
              </span>
              {ZOOM_PRESETS.map((preset) => {
                const active = zoomPreset === preset.value;
                return (
                  <button
                    key={String(preset.value)}
                    type="button"
                    onClick={() => setZoomPreset(preset.value)}
                    className={[
                      "rounded-full border px-3 py-1 text-[0.72rem] font-medium transition-colors",
                      active
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8",
                    ].join(" ")}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Fit keeps a calmer recruiter-style reading distance inside the frame.
            </p>
          </div>
        </div>

        <div
          ref={frameRef}
          className="mt-6 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(58,86,134,0.18),_transparent_42%),linear-gradient(180deg,#121927_0%,#0f1522_100%)] px-4 py-6 sm:px-8 sm:py-9"
        >
          <div className="mx-auto overflow-x-auto">
            <ResumePreviewDocument
              resume={data}
              template={previewTemplate}
              exportMode={selectedMode}
              scale={activeScale}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">When to use ATS</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Use ATS Preview when an application portal is likely to parse your PDF before a human reviews it.
          </p>
        </div>
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">When to use Designed</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Use Designed Preview when you are sending the file directly to a recruiter, hiring manager, or referral.
          </p>
        </div>
        <div className="glass-panel rounded-2xl border border-white/10 p-5">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">Next actions</p>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={APP_ROUTES.resumeTailor(resumeId)}>
                <Wand2 className="mr-2 size-4" />
                Tailor for a job
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={APP_ROUTES.coverLetters}>
                <ScanSearch className="mr-2 size-4" />
                Open cover letters
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={APP_ROUTES.resumeEdit(resumeId)}>
                Return to editor
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
