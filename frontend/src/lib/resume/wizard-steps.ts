import {
  educationRowSchema,
  experienceRowSchema,
  personalInfoFormSchema,
  resumeCreateSchema,
  summaryFormSchema,
} from "@/lib/validation/resume-schema";
import type { ResumeCreateFormValues } from "@/lib/validation/resume-schema";

export const WIZARD_STEP_COUNT = 6;

/** Validate current step; returns error message or null. */
export function validateWizardStep(
  step: number,
  values: ResumeCreateFormValues,
): string | null {
  switch (step) {
    case 0: {
      if (!values.title?.trim()) return "Add a resume title.";
      if (!values.template_key) return "Choose a template.";
      return null;
    }
    case 1: {
      if (!values.personal_info) return "Personal information is required.";
      const r = personalInfoFormSchema.safeParse(values.personal_info);
      if (!r.success) return r.error.issues[0]?.message ?? "Check personal fields.";
      return null;
    }
    case 2: {
      const r = summaryFormSchema.safeParse(values.summary ?? { body: "" });
      if (!r.success) return r.error.issues[0]?.message ?? "Add a professional summary.";
      return null;
    }
    case 3: {
      for (const ex of values.experiences) {
        const r = experienceRowSchema.safeParse(ex);
        if (!r.success) return r.error.issues[0]?.message ?? "Fix experience entries.";
      }
      return null;
    }
    case 4: {
      for (const ed of values.educations) {
        const r = educationRowSchema.safeParse(ed);
        if (!r.success) return r.error.issues[0]?.message ?? "Fix education entries.";
      }
      return null;
    }
    case 5: {
      const r = resumeCreateSchema.safeParse(values);
      if (!r.success) return r.error.issues[0]?.message ?? "Review the form.";
      return null;
    }
    default:
      return null;
  }
}
