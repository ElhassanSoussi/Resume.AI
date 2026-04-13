"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { FormProvider, useFieldArray, useForm, Controller } from "react-hook-form";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { CheckboxField, TextAreaField, TextField } from "@/components/forms/form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ApiTokenCallout } from "@/components/system/api-token-callout";
import { useCreateResume } from "@/hooks/use-resumes";
import { APP_ROUTES } from "@/lib/auth/routes";
import {
  DEFAULT_RESUME_TEMPLATE,
  normalizeResumeTemplateKey,
} from "@/lib/resume/constants";
import { getDefaultResumeFormValues, toResumeCreateBody } from "@/lib/resume/mappers";
import { WIZARD_STEP_COUNT, validateWizardStep } from "@/lib/resume/wizard-steps";
import { cn } from "@/lib/utils";
import { resumeCreateSchema, type ResumeCreateFormValues } from "@/lib/validation/resume-schema";
import { ApiError } from "@/lib/api/client";
import { TemplatePicker } from "@/components/resume/template-picker";

const STEP_TITLES = [
  "Title & template",
  "Contact",
  "Summary",
  "Experience",
  "Education",
  "Skills & review",
] as const;

function BulletsEditor({
  control,
  index,
  label,
}: {
  control: Control<ResumeCreateFormValues>;
  index: number;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={`experiences.${index}.bullets`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={`exp-bullets-${index}`}>{label}</Label>
          <p className="text-xs text-muted-foreground">One bullet per line.</p>
          <textarea
            id={`exp-bullets-${index}`}
            className={cn(
              "flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={fieldState.invalid}
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
  control: Control<ResumeCreateFormValues>;
  index: number;
}) {
  return (
    <Controller
      control={control}
      name={`skills.${index}.items`}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <Label htmlFor={`skill-items-${index}`}>Skills (one per line)</Label>
          <textarea
            id={`skill-items-${index}`}
            className={cn(
              "flex min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "dark:bg-input/30",
            )}
            value={Array.isArray(field.value) ? field.value.join("\n") : ""}
            onChange={(e) => field.onChange(e.target.value.split("\n"))}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.error ? (
            <p className="text-xs text-destructive">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}

export function ResumeWizard() {
  const router = useRouter();
  const createMut = useCreateResume();
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const form = useForm<ResumeCreateFormValues>({
    defaultValues: getDefaultResumeFormValues(),
    mode: "onChange",
  });

  const { control, handleSubmit, getValues, watch } = form;

  const expArray = useFieldArray({ control, name: "experiences" });
  const eduArray = useFieldArray({ control, name: "educations" });
  const skillArray = useFieldArray({ control, name: "skills" });

  const progress = Math.round(((step + 1) / WIZARD_STEP_COUNT) * 100);

  const goNext = () => {
    const values = getValues();
    const err = validateWizardStep(step, values);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    if (step < WIZARD_STEP_COUNT - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    setStepError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const onCreate = handleSubmit(() => {
    const values = getValues();
    const err = validateWizardStep(WIZARD_STEP_COUNT - 1, values);
    if (err) {
      setStepError(err);
      return;
    }
    const parsed = resumeCreateSchema.safeParse(values);
    if (!parsed.success) {
      setStepError(parsed.error.issues[0]?.message ?? "Review the form.");
      return;
    }
    setStepError(null);
    createMut.mutate(toResumeCreateBody(parsed.data), {
      onSuccess: (data) => {
        router.push(APP_ROUTES.resumeEdit(data.id));
      },
    });
  });

  const templateKey = watch("template_key");

  return (
    <FormProvider {...form}>
      <Card className="glass-panel mx-auto max-w-3xl border-white/[0.09]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="font-heading text-xl">New resume</CardTitle>
              <CardDescription>
                Step {step + 1} of {WIZARD_STEP_COUNT}: {STEP_TITLES[step]}
              </CardDescription>
            </div>
            <Progress value={progress} className="w-full max-w-[220px] sm:mt-1">
              <div className="flex w-full items-center gap-2">
                <ProgressLabel className="text-xs text-muted-foreground">Progress</ProgressLabel>
                <ProgressValue />
              </div>
            </Progress>
          </div>
          <ApiTokenCallout />
          {stepError ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {stepError}
            </p>
          ) : null}
          {createMut.isError && createMut.error instanceof ApiError ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              We couldn’t create the resume right now. Please review the details and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 ? (
            <div className="space-y-4">
              <TextField control={control} name="title" label="Resume title" placeholder="e.g. Product Designer — 2026" />
              <div className="space-y-2">
                <Label>Designed template</Label>
                <p className="text-sm text-muted-foreground">
                  Pick the premium layout you want for preview and designed PDF export. ATS Export stays separate and
                  always uses ATS Classic.
                </p>
                <TemplatePicker
                  selected={normalizeResumeTemplateKey(templateKey || DEFAULT_RESUME_TEMPLATE)}
                  variant="editor"
                  onSelect={(value) => {
                    form.setValue("template_key", value, { shouldDirty: true, shouldTouch: true });
                  }}
                />
              </div>
            </div>
          ) : null}

          {step === 1 ? (
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
          ) : null}

          {step === 2 ? (
            <TextAreaField
              control={control}
              name="summary.body"
              label="Professional summary"
              rows={8}
              description="A concise overview of your role, strengths, and goals."
            />
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              {expArray.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roles yet. Add your most recent position — you can add more anytime in the editor.
                </p>
              ) : null}
              {expArray.fields.map((f, index) => (
                <div key={f.id} className="space-y-4 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">Role {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => expArray.remove(index)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove role</span>
                    </Button>
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
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-6">
              {eduArray.fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add at least one education entry, or continue if none apply.</p>
              ) : null}
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
                      <span className="sr-only">Remove education</span>
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
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 p-4 text-sm">
                <p className="font-medium">Review</p>
                <Separator className="my-3" />
                <dl className="grid gap-2 text-muted-foreground">
                  <div className="flex justify-between gap-4">
                    <dt>Title</dt>
                    <dd className="text-foreground">{title || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>Template</dt>
                    <dd className="text-foreground">{templateKey || "—"}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">Skills (optional)</p>
                {skillArray.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Group skills by category, or skip and add later.</p>
                ) : null}
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
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0 || createMut.isPending}>
              Back
            </Button>
            <div className="flex gap-2">
              {step < WIZARD_STEP_COUNT - 1 ? (
                <Button type="button" onClick={goNext} disabled={createMut.isPending}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={onCreate} disabled={createMut.isPending}>
                  {createMut.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create resume"
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
