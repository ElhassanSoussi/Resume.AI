import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

/** Rough completion estimate for the editor progress bar (0–100). */
export function resumeCompletionPercent(values: ResumeFullUpdateFormValues): number {
  let score = 0;
  const parts = 6;

  if (values.title?.trim()) score += 1;
  if (values.template_key) score += 1;
  const p = values.personal_info;
  if (p?.first_name?.trim() && p?.last_name?.trim() && p?.email?.trim()) score += 1;
  if (values.summary?.body?.trim()) score += 1;
  if (values.experiences?.length) score += 1;
  if (values.educations?.length) score += 1;

  return Math.round((score / parts) * 100);
}
