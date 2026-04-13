"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Maximize2, ScanSearch, Wand2 } from "lucide-react";

import { ExportModePicker } from "@/components/resume/export-mode-picker";
import { ResumePreviewDocument } from "@/components/resume/resume-preview-document";
import { ResumeReadinessPanel } from "@/components/resume/resume-readiness-panel";
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
import { resumeReadToFormValues } from "@/lib/resume/mappers";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

type Props = { resumeId: string };

type RailTab = "overview" | "export" | "template" | "actions";

const ZOOM_PRESETS = [
  { value: "fit", label: "Fit" },
  { value: 0.75, label: "75%" },
  { value: 0.9, label: "90%" },
  { value: 1, label: "100%" },
] as const;

const RAIL_TABS: Array<{ id: RailTab; label: string }> = [
  { id: "overview", label: "Readiness" },
  { id: "export", label: "Export" },
  { id: "template", label: "Template" },
  { id: "actions", label: "Next" },
];

export function ResumePreviewLive({ resumeId }: Props) {
  const { data, isLoading, isError } = useResume(resumeId);
  useEffect(() => {
    track(ANALYTICS_EVENTS.PREVIEW_OPENED, { resume_id: resumeId });
  }, [resumeId]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryTemplate = searchParams.get("template");
  const queryMode = searchParams.get("mode");
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [fitScale, setFitScale] = useState(0.92);
  const [zoomPreset, setZoomPreset] = useState<(typeof ZOOM_PRESETS)[number]["value"]>("fit");
  const [railTab, setRailTab] = useState<RailTab>("overview");

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    const updateScale = () => {
      const availableWidth = node.clientWidth - 96;
      const computed = availableWidth / 980;
      setFitScale(Math.max(0.68, Math.min(0.82, computed)));
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
      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:gap-4">
        <Skeleton className="min-h-[50vh] flex-1 rounded-xl lg:min-h-[min(85dvh,760px)]" />
        <Skeleton className="h-72 shrink-0 rounded-xl lg:h-auto lg:w-[300px]" />
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
  const activeScale = zoomPreset === "fit" ? fitScale : zoomPreset;

  const updateMode = (mode: "ats" | "designed") => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", mode);
    if (!next.get("template")) next.set("template", designedTemplate);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
      {/* Document studio — primary surface */}
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a1019] shadow-[0_12px_48px_-24px_rgba(0,0,0,0.55)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-[0.95rem] font-semibold text-slate-100">{data.title}</p>
            <p className="text-[0.65rem] text-slate-500">White-paper preview · margins match export</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8 text-xs" asChild>
              <Link href={APP_ROUTES.resumeEdit(resumeId)}>Edit</Link>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-200 hover:bg-white/10 hover:text-white" asChild>
              <Link href={APP_ROUTES.resumeTailor(resumeId)}>Tailor</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center gap-1.5 text-[0.62rem] uppercase tracking-wider text-slate-400">
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">
              {selectedMode === "ats" ? "ATS" : "Designed"}
            </span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5">{previewTemplateMeta.label}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize2 className="size-3 text-slate-600" aria-hidden />
            {ZOOM_PRESETS.map((preset) => {
              const active = zoomPreset === preset.value;
              return (
                <button
                  key={String(preset.value)}
                  type="button"
                  onClick={() => setZoomPreset(preset.value)}
                  className={cn(
                    "rounded border px-2 py-0.5 text-[0.62rem] font-medium transition-colors",
                    active
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:bg-white/10",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          ref={frameRef}
          className="min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_top,_rgba(58,86,134,0.12),_transparent_38%),linear-gradient(180deg,#121927_0%,#0f1522_100%)] px-4 py-6 sm:px-6 sm:py-8"
        >
          <div className="mx-auto flex min-h-full min-w-0 max-w-[980px] justify-center">
            <ResumePreviewDocument
              resume={data}
              template={previewTemplate}
              exportMode={selectedMode}
              scale={activeScale}
            />
          </div>
        </div>
      </section>

      {/* Compact control rail */}
      <aside className="flex max-h-[min(52vh,420px)] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-card/30 shadow-[0_8px_32px_-20px_rgba(0,0,0,0.4)] backdrop-blur-sm lg:max-h-none lg:w-[min(100%,320px)] lg:shrink-0">
        <div className="shrink-0 border-b border-white/10 p-2">
          <div className="grid grid-cols-4 gap-0.5 rounded-lg bg-muted/60 p-0.5">
            {RAIL_TABS.map((t) => {
              const on = railTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRailTab(t.id)}
                  className={cn(
                    "rounded-md px-1 py-1.5 text-center text-[0.62rem] font-semibold uppercase tracking-wide transition-colors",
                    on ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
          {railTab === "overview" ? (
            <ResumeReadinessPanel
              resumeId={resumeId}
              values={resumeReadToFormValues(data)}
              activeExportMode={selectedMode}
              compact
              hideFooterActions
            />
          ) : null}

          {railTab === "export" ? (
            <div className="space-y-3">
              <ExportModePicker selected={selectedMode} onSelect={updateMode} compact />
              <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground/85">ATS</span> for portals that parse first.{" "}
                <span className="font-medium text-foreground/85">Designed</span> for humans reviewing a PDF.
              </p>
            </div>
          ) : null}

          {railTab === "template" ? (
            <div className="space-y-2">
              {selectedMode === "ats" ? (
                <p className="text-[0.68rem] text-muted-foreground">
                  ATS preview uses ATS Classic. Switch to <strong className="text-foreground/90">Designed</strong> to
                  browse the full catalog.
                </p>
              ) : (
                <p className="text-[0.65rem] text-muted-foreground">Designed templates — ATS-safe sets marked.</p>
              )}
              <div className="max-h-[min(48vh,360px)] overflow-y-auto pr-0.5 lg:max-h-[min(70vh,520px)]">
                <TemplatePicker
                  resumeId={resumeId}
                  selected={designedTemplate}
                  variant="preview"
                  disabled={selectedMode === "ats"}
                  previewMode={selectedMode}
                  density="compact"
                />
              </div>
            </div>
          ) : null}

          {railTab === "actions" ? (
            <div className="space-y-2">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">Continue</p>
              <div className="flex flex-col gap-1.5">
                <Button variant="default" size="sm" className="h-9 justify-start text-xs" asChild>
                  <Link href={APP_ROUTES.resumeTailor(resumeId)}>
                    <Wand2 className="mr-2 size-3.5 shrink-0" />
                    Tailor for a job
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="h-9 justify-start text-xs" asChild>
                  <Link href={APP_ROUTES.coverLetters}>
                    <ScanSearch className="mr-2 size-3.5 shrink-0" />
                    Cover letters
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="h-9 justify-start text-xs" asChild>
                  <Link href={APP_ROUTES.resumeEdit(resumeId)}>
                    Back to editor
                    <ArrowRight className="ml-auto size-3.5 shrink-0" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
