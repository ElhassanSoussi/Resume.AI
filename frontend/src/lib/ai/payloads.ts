import type {
  OptimizeEducationInput,
  OptimizeResumeRequest,
  ResumeWritingMode,
  OptimizeSkillCategoryInput,
  RewriteExperienceRequest,
} from "@/lib/types/ai";
import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

function cleanBullets(bullets: string[]): string[] {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

/** ISO date string YYYY-MM-DD for FastAPI `date` fields. */
function isoDate(s: string | undefined): string | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  return t.slice(0, 10);
}

export function experienceRowToRewriteRequest(
  row: ResumeFullUpdateFormValues["experiences"][number],
  writingMode: ResumeWritingMode = "balanced",
): RewriteExperienceRequest {
  const start = isoDate(row.start_date);
  if (!start) {
    throw new Error("Each experience needs a start date for AI rewrite.");
  }
  const endRaw = isoDate(row.end_date ?? "");
  return {
    company: row.company.trim(),
    job_title: row.job_title.trim(),
    location: row.location?.trim() ? row.location.trim() : null,
    start_date: start,
    end_date: row.is_current ? null : endRaw,
    is_current: row.is_current,
    bullets: cleanBullets(row.bullets),
    writing_mode: writingMode,
  };
}

function educationToOptimizeInput(
  row: ResumeFullUpdateFormValues["educations"][number],
): OptimizeEducationInput {
  return {
    institution: row.institution.trim(),
    degree: row.degree.trim(),
    field_of_study: row.field_of_study?.trim() ? row.field_of_study.trim() : null,
  };
}

function skillToOptimizeInput(
  row: ResumeFullUpdateFormValues["skills"][number],
): OptimizeSkillCategoryInput {
  return {
    category: row.category.trim() || "Skills",
    items: row.items.map((s) => s.trim()).filter(Boolean),
  };
}

export function resumeFormToOptimizeRequest(
  values: ResumeFullUpdateFormValues,
  writingMode: ResumeWritingMode = "balanced",
): OptimizeResumeRequest {
  const p = values.personal_info;
  const hasPersonal =
    p &&
    p.first_name.trim() &&
    p.last_name.trim() &&
    p.email.trim();

  const summaryBody = values.summary?.body?.trim();
  return {
    title: values.title.trim(),
    personal_info: hasPersonal
      ? {
        first_name: p!.first_name.trim(),
        last_name: p!.last_name.trim(),
        email: p!.email.trim(),
        phone: p!.phone?.trim() ? p!.phone.trim() : null,
        location: p!.location?.trim() ? p!.location.trim() : null,
      }
      : undefined,
    summary_body: summaryBody && summaryBody.length > 0 ? summaryBody : null,
    experiences: values.experiences.map((row) => experienceRowToRewriteRequest(row, writingMode)),
    educations: values.educations.map(educationToOptimizeInput),
    skills: values.skills.map(skillToOptimizeInput),
    writing_mode: writingMode,
  };
}
