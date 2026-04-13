"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Control } from "react-hook-form";
import { FormProvider, useFieldArray, useForm, useWatch, Controller } from "react-hook-form";
import { ArrowRight, Eye, Loader2, Plus, Sparkles, Trash2, Wand2 } from "lucide-react";

import { CheckboxField, TextAreaField, TextField } from "@/components/forms/form-fields";
import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { ResumeAiPanel } from "@/components/resume/resume-ai-panel";
import { ResumeCoachPanel } from "@/components/resume/resume-coach-panel";
import { ResumeExportSection } from "@/components/resume/resume-export-section";
import { ResumeReadinessPanel } from "@/components/resume/resume-readiness-panel";
import { TemplatePicker } from "@/components/resume/template-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiResumeMutations } from "@/hooks/use-ai-resume";
import { useResume, useUpdateResumeFull } from "@/hooks/use-resumes";
import { experienceRowToRewriteRequest } from "@/lib/ai/payloads";
import { ApiError } from "@/lib/api/client";
import { APP_ROUTES } from "@/lib/auth/routes";
import type { ResumeWritingMode } from "@/lib/types/ai";
import {
  DEFAULT_RESUME_TEMPLATE,
  normalizeResumeTemplateKey,
} from "@/lib/resume/constants";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import { shouldFireResumeCompletedEvent } from "@/lib/analytics/resume-complete";
import { resumeCompletionPercent } from "@/lib/resume/completion";
import {
  loadWorkspaceCareerPrefs,
  suggestedWritingMode,
} from "@/lib/onboarding/workspace-preferences";
import {
  getDefaultFullResumeFormValues,
  resumeReadToFormValues,
  toResumeFullUpdateBody,
} from "@/lib/resume/mappers";
import { cn } from "@/lib/utils";
import {
  resumeFullUpdateSchema,
  type ResumeFullUpdateFormValues,
} from "@/lib/validation/resume-schema";

function BulletsEditor({
  control,
  index,
  label,
}: {
  control: Control<ResumeFullUpdateFormValues>;
  index: number;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={`experiences.${index}.bullets`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={`edit-exp-bullets-${index}`}>{label}</Label>
          <p className="text-xs text-muted-foreground">One bullet per line.</p>
          <textarea
            id={`edit-exp-bullets-${index}`}
            className={cn(
              "flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            placeholder={"Led cross-functional initiative that improved...\nBuilt or launched...\nStreamlined or reduced..."}
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={fieldState.invalid ? "true" : undefined}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

function SkillItemsEditor({
  control,
  index,
}: {
  control: Control<ResumeFullUpdateFormValues>;
  index: number;
}) {
  return (
    <Controller
      control={control}
      name={`skills.${index}.items`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={`edit-skill-items-${index}`}>Skills (one per line)</Label>
          <textarea
            id={`edit-skill-items-${index}`}
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            placeholder={"SQL\nPython\nUser research\nRoadmapping"}
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={fieldState.invalid ? "true" : undefined}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function ResumeEditorForm({ resumeId }: { resumeId: string }) {
  const { data, isLoading, isError } = useResume(resumeId);
  const updateMut = useUpdateResumeFull(resumeId);
  const ai = useAiResumeMutations();
  const [rewritingExpIndex, setRewritingExpIndex] = useState<number | null>(null);
  const [expAiError, setExpAiError] = useState<string | null>(null);
  const [writingMode, setWritingMode] = useState<ResumeWritingMode>("balanced");
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
    }
  }, [data, reset]);

  const watched = useWatch({ control });
  const completion = resumeCompletionPercent(
    (watched as ResumeFullUpdateFormValues) ?? getDefaultFullResumeFormValues(),
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
    const t = setTimeout(() => {
      saveValid();
    }, 1400);
    return () => clearTimeout(t);
  }, [watched, data, isDirty, saveValid]);

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
      } catch (e) {
        setExpAiError(e instanceof Error ? e.message : "Could not rewrite this role.");
      }
    },
    [ai.rewriteExperience, getValues, setValue, writingMode],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
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

  return (
    <FormProvider {...form}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Autosaves a few seconds after you stop typing.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {updateMut.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Saving…
                </>
              ) : isDirty ? (
                <span>Unsaved changes — saving soon…</span>
              ) : (
                <span>All changes saved</span>
              )}
            </div>
          </div>
          <Progress value={completion} className="w-full max-w-[240px]">
            <div className="flex w-full items-center justify-between gap-2">
              <ProgressLabel className="text-xs text-muted-foreground">Completion</ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
        </div>

        <ApiTokenCallout />

        {updateMut.isError && updateMut.error instanceof ApiError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We couldn’t save your latest edits. Your current draft is still in the editor, so please try again.
          </p>
        ) : null}

        <ResumeAiPanel
          resumeId={resumeId}
          getValues={getValues}
          setValue={setValue}
          ai={ai}
          writingMode={writingMode}
          onWritingModeChange={setWritingMode}
        />

        <ResumeReadinessPanel
          resumeId={resumeId}
          values={(watched as ResumeFullUpdateFormValues) ?? getDefaultFullResumeFormValues()}
        />

        <Suspense fallback={<Skeleton className="h-28 w-full rounded-xl" />}>
          <ResumeExportSection
            resumeId={resumeId}
            templateKey={normalizeResumeTemplateKey(templateKey || data.template_key || DEFAULT_RESUME_TEMPLATE)}
          />
        </Suspense>

        <ResumeCoachPanel
          resumeId={resumeId}
          values={(watched as ResumeFullUpdateFormValues) ?? getDefaultFullResumeFormValues()}
        />

        <div className="space-y-2">
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
              This controls your live preview and Designed Export. ATS Export always uses ATS Classic.
            </p>
            <TemplatePicker
              variant="editor"
              selected={normalizeResumeTemplateKey(templateKey)}
              disabled={ai.aiBusy}
              onSelect={(value) => {
                setValue("template_key", value, { shouldDirty: true, shouldTouch: true });
              }}
            />
          </div>
        </div>

        <Separator />

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Contact</h3>
          <p className="text-sm text-muted-foreground">
            Keep this restrained and factual. Recruiters should find the essentials immediately without the header feeling crowded.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField control={control} name="personal_info.first_name" label="First name" />
            <TextField control={control} name="personal_info.last_name" label="Last name" />
            <TextField control={control} name="personal_info.email" label="Email" type="email" />
            <TextField control={control} name="personal_info.phone" label="Phone" />
            <TextField control={control} name="personal_info.location" label="Location" className="sm:col-span-2" />
            <TextField control={control} name="personal_info.website" label="Website" />
            <TextField control={control} name="personal_info.linkedin_url" label="LinkedIn URL" />
            <TextField control={control} name="personal_info.github_url" label="GitHub URL" className="sm:col-span-2" />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="font-heading text-sm font-semibold">Summary</h3>
          <p className="text-sm text-muted-foreground">
            Aim for 2-4 sentences covering your level, focus, and strengths. Avoid generic self-descriptions and keep the tone recruiter-ready.
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

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Experience</h3>
          <p className="text-sm text-muted-foreground">
            Lead with ownership, scope, and outcomes when facts support them. Strong roles usually have 2-4 high-signal bullets.
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
          {expArray.fields.map((f, index) => (
            <div key={f.id} className="space-y-4 rounded-xl border border-white/10 p-4">
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
              <CheckboxField control={control} name={`experiences.${index}.is_current`} label="I currently work here" />
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

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Education</h3>
          <p className="text-sm text-muted-foreground">
            Keep this concise. Early-career resumes can lean on coursework, honors, or academic context more than senior resumes do.
          </p>
          {eduArray.fields.map((f, index) => (
            <div key={f.id} className="space-y-4 rounded-xl border border-white/10 p-4">
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
                <TextField control={control} name={`educations.${index}.field_of_study`} label="Field of study" />
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

        <section className="space-y-4">
          <h3 className="font-heading text-sm font-semibold">Skills</h3>
          <p className="text-sm text-muted-foreground">
            Group skills into clear categories rather than one long list. Good labels help both recruiters and ATS systems scan faster.
          </p>
          {skillArray.fields.map((f, index) => (
            <div key={f.id} className="space-y-4 rounded-xl border border-white/10 p-4">
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

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="space-y-1">
            <p className="font-heading text-sm font-semibold text-foreground">Ready to move forward?</p>
            <p className="text-sm text-muted-foreground">
              Save your progress, then preview, tailor for a role, or export a recruiter-ready PDF.
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
    </FormProvider>
  );
}
