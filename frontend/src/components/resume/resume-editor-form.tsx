"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Control } from "react-hook-form";
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  ArrowRight,
  Eye,
  History,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";

import { CheckboxField, TextAreaField, TextField } from "@/components/forms/form-fields";
import { ExportModePicker } from "@/components/resume/export-mode-picker";
import { ResumeAiPanel } from "@/components/resume/resume-ai-panel";
import { ResumeCoachPanel } from "@/components/resume/resume-coach-panel";
import { ResumeExportSection } from "@/components/resume/resume-export-section";
import { ResumePreviewDocument } from "@/components/resume/resume-preview-document";
import { ResumeReadinessPanel } from "@/components/resume/resume-readiness-panel";
import { TemplatePicker } from "@/components/resume/template-picker";
import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiResumeMutations } from "@/hooks/use-ai-resume";
import { useResume, useUpdateResumeFull } from "@/hooks/use-resumes";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import { shouldFireResumeCompletedEvent } from "@/lib/analytics/resume-complete";
import { experienceRowToRewriteRequest } from "@/lib/ai/payloads";
import { ApiError } from "@/lib/api/client";
import { APP_ROUTES } from "@/lib/auth/routes";
import {
  DEFAULT_RESUME_TEMPLATE,
  normalizeResumeTemplateKey,
  resolvePreviewTemplate,
  type ResumeExportMode,
} from "@/lib/resume/constants";
import { resumeCompletionPercent } from "@/lib/resume/completion";
import {
  formValuesToPreviewResume,
  getDefaultFullResumeFormValues,
  resumeReadToFormValues,
  toResumeFullUpdateBody,
} from "@/lib/resume/mappers";
import {
  loadWorkspaceCareerPrefs,
  suggestedExportMode,
  suggestedWritingMode,
} from "@/lib/onboarding/workspace-preferences";
import type { ResumeWritingMode } from "@/lib/types/ai";
import { cn } from "@/lib/utils";
import {
  resumeFullUpdateSchema,
  type ResumeFullUpdateFormValues,
} from "@/lib/validation/resume-schema";

type BulletsEditorProps = Readonly<{
  control: Control<ResumeFullUpdateFormValues>;
  index: number;
  label: string;
}>;

function BulletsEditor({
  control,
  index,
  label,
}: BulletsEditorProps) {
  const uid = useId();
  const bulletsId = `bullets-exp-${index}-${uid}`;

  return (
    <Controller
      control={control}
      name={`experiences.${index}.bullets`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>{label}</Label>
          <p className="text-xs text-muted-foreground">One bullet per line.</p>
          <textarea
            id={bulletsId}
            className={cn(
              "flex min-h-25 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            placeholder={
              "Led cross-functional initiative that improved...\nBuilt or launched...\nStreamlined or reduced..."
            }
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={!!fieldState.invalid}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

type SkillItemsEditorProps = Readonly<{
  control: Control<ResumeFullUpdateFormValues>;
  index: number;
}>;

function SkillItemsEditor({
  control,
  index,
}: SkillItemsEditorProps) {
  const uid = useId();
  const skillsId = `skills-skill-${index}-${uid}`;

  return (
    <Controller
      control={control}
      name={`skills.${index}.items`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label>Skills (one per line)</Label>
          <textarea
            id={skillsId}
            className={cn(
              "flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            placeholder={"SQL\nPython\nUser research\nRoadmapping"}
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={!!fieldState.invalid}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

type ResumeEditorFormProps = Readonly<{ resumeId: string }>;

export function ResumeEditorForm({ resumeId }: ResumeEditorFormProps) {
  const { data, isLoading, isError } = useResume(resumeId);
  const updateMut = useUpdateResumeFull(resumeId);
  const ai = useAiResumeMutations();

  const [rewritingExpIndex, setRewritingExpIndex] = useState<number | null>(null);
  const [expAiError, setExpAiError] = useState<string | null>(null);
  const [writingMode, setWritingMode] = useState<ResumeWritingMode>("balanced");
  const [previewMode, setPreviewMode] = useState<ResumeExportMode>("designed");
  const hydrated = useRef(false);

  const form = useForm<ResumeFullUpdateFormValues>({
    defaultValues: getDefaultFullResumeFormValues(),
    mode: "onChange",
  });

  const { control, reset, getValues, setValue, watch, formState } = form;
  const { isDirty } = formState;
  const templateKey = watch("template_key");

  const expArray = useFieldArray({ control, name: "experiences" });
  const eduArray = useFieldArray({ control, name: "educations" });
  const skillArray = useFieldArray({ control, name: "skills" });

  useEffect(() => {
    if (!data) return;
    reset(resumeReadToFormValues(data));
    hydrated.current = true;
    const prefs = loadWorkspaceCareerPrefs();
    if (prefs?.completedAt) {
      setWritingMode(suggestedWritingMode(prefs));
      setPreviewMode(suggestedExportMode(prefs));
    }
  }, [data, reset]);

  const watched = useWatch({ control });
  const deferredWatched = useDeferredValue(watched);
  const liveValues =
    (watched as ResumeFullUpdateFormValues) ?? getDefaultFullResumeFormValues();
  const previewValues =
    (deferredWatched as ResumeFullUpdateFormValues) ?? getDefaultFullResumeFormValues();

  const completion = resumeCompletionPercent(liveValues);

  const saveStateMessage = useMemo(() => {
    if (updateMut.isPending) {
      return "Saving your latest edits…";
    }
    if (isDirty) {
      return "Changes detected. We're autosave when you pause.";
    }
    return "All changes saved. Keep refining or move to preview.";
  }, [updateMut.isPending, isDirty]);

  const previewResume = useMemo(
    () =>
      formValuesToPreviewResume(previewValues, {
        id: data?.id ?? resumeId,
        user_id: data?.user_id ?? "preview-user",
        created_at: data?.created_at ?? new Date().toISOString(),
        updated_at: data?.updated_at ?? new Date().toISOString(),
      }),
    [data?.created_at, data?.id, data?.updated_at, data?.user_id, previewValues, resumeId],
  );

  useEffect(() => {
    if (completion < 100) return;
    if (!shouldFireResumeCompletedEvent(resumeId)) return;
    track(ANALYTICS_EVENTS.RESUME_COMPLETED, { resume_id: resumeId });
  }, [completion, resumeId]);

  const saveValid = useCallback(() => {
    if (!hydrated.current) return;
    const values = getValues();
    const parsed = resumeFullUpdateSchema.safeParse(values);
    if (!parsed.success) return;
    updateMut.mutate(toResumeFullUpdateBody(parsed.data), {
      onSuccess: (updated) => {
        reset(resumeReadToFormValues(updated));
      },
    });
  }, [getValues, reset, updateMut]);

  useEffect(() => {
    if (!data || !isDirty) return;
    const timer = setTimeout(() => {
      saveValid();
    }, 1400);
    return () => clearTimeout(timer);
  }, [data, isDirty, saveValid, watched]);

  const runExperienceRewrite = useCallback(
    (index: number) => {
      setExpAiError(null);
      try {
        const row = getValues(`experiences.${index}`);
        const payload = experienceRowToRewriteRequest(row, writingMode);
        setRewritingExpIndex(index);
        ai.rewriteExperience.mutate(payload, {
          onSuccess: (res) => {
            setValue(`experiences.${index}.bullets`, res.bullets, {
              shouldDirty: true,
              shouldTouch: true,
            });
          },
          onSettled: () => setRewritingExpIndex(null),
        });
      } catch (error) {
        setExpAiError(error instanceof Error ? error.message : "Could not rewrite this role.");
      }
    },
    [ai.rewriteExperience, getValues, setValue, writingMode],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-105 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        We couldn’t load this resume right now. Refresh the page and try again.
      </div>
    );
  }

  if (!data) return null;

  const normalizedTemplate = normalizeResumeTemplateKey(
    templateKey || data.template_key || DEFAULT_RESUME_TEMPLATE,
  );

  return (
    <FormProvider {...form}>
      <div className="space-y-5">
        <div className="glass-panel rounded-2xl border border-white/9 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Builder workspace
              </p>
              <div className="space-y-1">
                <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  {data.title || "Untitled resume"}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Edit the source of truth, watch the live paper update, then move into preview, tailoring, and export
                  when the document is ready to send.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" asChild>
                <Link href={APP_ROUTES.resumePreview(resumeId)}>
                  <Eye className="mr-2 size-4" />
                  Full preview
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={APP_ROUTES.resumeTailor(resumeId)}>
                  <Wand2 className="mr-2 size-4" />
                  Tailor
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={APP_ROUTES.resumeVersions(resumeId)}>
                  <History className="mr-2 size-4" />
                  Versions
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-xl border border-white/8 bg-white/2 px-3 py-3">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Save state
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
                {updateMut.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving your latest edits…
                  </>
                ) : (
                  <span>{saveStateMessage}</span>
                )}
              </div>
            </div>

            <Progress value={completion} className="h-auto w-full px-3 py-3">
              <div className="flex w-full items-center justify-between gap-2">
                <ProgressLabel className="text-xs text-muted-foreground">Document depth</ProgressLabel>
                <ProgressValue />
              </div>
            </Progress>
          </div>
        </div>

        <ApiTokenCallout />

        {updateMut.isError && updateMut.error instanceof ApiError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We couldn’t save your latest edits. Your current draft is still in the editor, so please try again.
          </p>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <ResumeAiPanel
              resumeId={resumeId}
              getValues={getValues}
              setValue={setValue}
              ai={ai}
              writingMode={writingMode}
              onWritingModeChange={setWritingMode}
            />

            <Suspense fallback={<Skeleton className="h-28 w-full rounded-xl" />}>
              <ResumeExportSection
                resumeId={resumeId}
                templateKey={normalizedTemplate}
              />
            </Suspense>

            <ResumeCoachPanel resumeId={resumeId} values={liveValues} />

            <div className="space-y-2" id="resume-basics">
              <TextField control={control} name="title" label="Resume title" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <select
                        id="status"
                        className={cn(
                          "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                          "dark:bg-input/30",
                        )}
                        {...field}
                      >
                        <option value="draft">Draft</option>
                        <option value="complete">Complete</option>
                      </select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Designed template
                </Label>
                <p className="text-sm text-muted-foreground">
                  This drives your live preview and Designed Export. ATS Export stays parser-safe regardless of your
                  designed selection.
                </p>
                <TemplatePicker
                  variant="editor"
                  selected={normalizedTemplate}
                  disabled={ai.aiBusy}
                  onSelect={(value) => {
                    setValue("template_key", value, { shouldDirty: true, shouldTouch: true });
                  }}
                />
              </div>
            </div>

            <Separator />

            <section className="space-y-4" id="resume-contact">
              <h3 className="font-heading text-sm font-semibold">Contact</h3>
              <p className="text-sm text-muted-foreground">
                Keep this restrained and factual. Recruiters should find the essentials immediately without the header
                feeling crowded.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField control={control} name="personal_info.first_name" label="First name" />
                <TextField control={control} name="personal_info.last_name" label="Last name" />
                <TextField control={control} name="personal_info.email" label="Email" type="email" />
                <TextField control={control} name="personal_info.phone" label="Phone" />
                <TextField
                  control={control}
                  name="personal_info.location"
                  label="Location"
                  className="sm:col-span-2"
                />
                <TextField control={control} name="personal_info.website" label="Website" />
                <TextField control={control} name="personal_info.linkedin_url" label="LinkedIn URL" />
                <TextField
                  control={control}
                  name="personal_info.github_url"
                  label="GitHub URL"
                  className="sm:col-span-2"
                />
              </div>
            </section>

            <Separator />

            <section className="space-y-3" id="resume-summary">
              <h3 className="font-heading text-sm font-semibold">Summary</h3>
              <p className="text-sm text-muted-foreground">
                Aim for 2-4 sentences covering your level, focus, and strengths. Avoid generic self-descriptions and
                keep the tone recruiter-ready.
              </p>
              <TextAreaField
                control={control}
                name="summary.body"
                label="Professional summary"
                rows={8}
                placeholder="Product designer with 6+ years leading end-to-end experience design across B2B SaaS platforms, translating complex workflows into clear, measurable user experiences..."
              />
            </section>

            <Separator />

            <section className="space-y-4" id="resume-experience">
              <h3 className="font-heading text-sm font-semibold">Experience</h3>
              <p className="text-sm text-muted-foreground">
                Lead with ownership, scope, and outcomes when facts support them. Strong roles usually have 2-4
                high-signal bullets.
              </p>
              {expAiError ? (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {expAiError}
                </p>
              ) : null}
              {ai.rewriteExperience.error instanceof ApiError ? (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  We couldn’t rewrite this role right now. Please try again.
                </p>
              ) : null}
              {expArray.fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-xl border border-white/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">Role {index + 1}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={ai.aiBusy}
                        onClick={() => runExperienceRewrite(index)}
                        className="border-primary/30"
                      >
                        {rewritingExpIndex === index ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="mr-1.5 size-3.5" />
                            Rewrite bullets
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => expArray.remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={control} name={`experiences.${index}.company`} label="Company" />
                    <TextField control={control} name={`experiences.${index}.job_title`} label="Job title" />
                    <TextField control={control} name={`experiences.${index}.location`} label="Location" />
                    <TextField control={control} name={`experiences.${index}.start_date`} label="Start" type="date" />
                    <TextField
                      control={control}
                      name={`experiences.${index}.end_date`}
                      label="End"
                      type="date"
                      disabled={watch(`experiences.${index}.is_current`)}
                    />
                  </div>
                  <CheckboxField
                    control={control}
                    name={`experiences.${index}.is_current`}
                    label="I currently work here"
                  />
                  <BulletsEditor control={control} index={index} label="Highlights" />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  expArray.append({
                    company: "",
                    job_title: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    is_current: false,
                    bullets: [""],
                    sort_order: expArray.fields.length,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Add experience
              </Button>
            </section>

            <Separator />

            <section className="space-y-4" id="resume-education">
              <h3 className="font-heading text-sm font-semibold">Education</h3>
              <p className="text-sm text-muted-foreground">
                Keep this concise. Early-career resumes can lean on coursework, honors, or academic context more than
                senior resumes do.
              </p>
              {eduArray.fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">School {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => eduArray.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField control={control} name={`educations.${index}.institution`} label="Institution" />
                    <TextField control={control} name={`educations.${index}.degree`} label="Degree" />
                    <TextField
                      control={control}
                      name={`educations.${index}.field_of_study`}
                      label="Field of study"
                    />
                    <TextField control={control} name={`educations.${index}.location`} label="Location" />
                    <TextField control={control} name={`educations.${index}.start_date`} label="Start" type="date" />
                    <TextField control={control} name={`educations.${index}.end_date`} label="End" type="date" />
                    <TextField control={control} name={`educations.${index}.gpa`} label="GPA (optional)" />
                  </div>
                  <TextAreaField
                    control={control}
                    name={`educations.${index}.description`}
                    label="Notes (optional)"
                    rows={3}
                    placeholder="Relevant coursework, honors, thesis focus, leadership, or academic projects."
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  eduArray.append({
                    institution: "",
                    degree: "",
                    field_of_study: "",
                    location: "",
                    start_date: "",
                    end_date: "",
                    gpa: "",
                    description: "",
                    sort_order: eduArray.fields.length,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Add education
              </Button>
            </section>

            <Separator />

            <section className="space-y-4" id="resume-skills">
              <h3 className="font-heading text-sm font-semibold">Skills</h3>
              <p className="text-sm text-muted-foreground">
                Group skills into clear categories rather than one long list. Good labels help both recruiters and ATS
                systems scan faster.
              </p>
              {skillArray.fields.map((field, index) => (
                <div key={field.id} className="space-y-4 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Group {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => skillArray.remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <TextField control={control} name={`skills.${index}.category`} label="Category" />
                  <SkillItemsEditor control={control} index={index} />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  skillArray.append({
                    category: "",
                    items: [""],
                    sort_order: skillArray.fields.length,
                  })
                }
              >
                <Plus className="mr-2 size-4" />
                Add skill group
              </Button>
            </section>

            <div className="space-y-4 rounded-xl border border-white/10 bg-white/2 p-5">
              <div className="space-y-1">
                <p className="font-heading text-sm font-semibold text-foreground">Ready to move forward?</p>
                <p className="text-sm text-muted-foreground">
                  Save your source draft, then preview, tailor for a role, or generate a matching cover letter.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    saveValid();
                  }}
                  disabled={updateMut.isPending}
                >
                  {updateMut.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save now"
                  )}
                </Button>
                <Button type="button" variant="secondary" asChild>
                  <Link href={APP_ROUTES.resumePreview(resumeId)}>
                    <Eye className="mr-2 size-4" />
                    Preview
                  </Link>
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={APP_ROUTES.resumeTailor(resumeId)}>
                    <Wand2 className="mr-2 size-4" />
                    Tailor for a role
                  </Link>
                </Button>
                <Button type="button" variant="ghost" asChild>
                  <Link href={APP_ROUTES.coverLetterNew}>
                    Cover letter
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
            <div className="glass-panel rounded-2xl border border-white/8 p-4">
              <div className="space-y-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Live document
                </p>
                <h3 className="font-heading text-sm font-semibold text-foreground">Builder preview</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Keep the paper in view while you edit. Switch export posture here, then open the full preview studio
                  when you want a larger inspection.
                </p>
              </div>

              <div className="mt-3">
                <ExportModePicker compact selected={previewMode} onSelect={setPreviewMode} />
              </div>

              <div className="mt-4 rounded-[26px] border border-white/8 bg-[#11151f] p-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="mx-auto rounded-[20px] border border-white/5 bg-[#171c27] px-3 py-3">
                  <div className="mx-auto overflow-hidden rounded-lg">
                    <ResumePreviewDocument
                      resume={previewResume}
                      template={resolvePreviewTemplate(normalizedTemplate, previewMode)}
                      exportMode={previewMode}
                      scale={0.42}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="flex-1" asChild>
                  <Link href={APP_ROUTES.resumePreview(resumeId)}>
                    <Eye className="mr-2 size-4" />
                    Open studio
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={APP_ROUTES.resumeTailor(resumeId)}>
                    <Wand2 className="mr-2 size-4" />
                    Tailor
                  </Link>
                </Button>
              </div>
            </div>

            <ResumeReadinessPanel
              resumeId={resumeId}
              values={previewValues}
              activeExportMode={previewMode}
              compact
            />

            <div className="rounded-xl border border-white/8 bg-white/2 p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Section jump
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-basics">Basics</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-contact">Contact</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-summary">Summary</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-experience">Experience</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-education">Education</a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="#resume-skills">Skills</a>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </FormProvider>
  );
}
