/** Mirrors FastAPI `app/schemas/ai.py` for `/api/v1/ai/*`. */

export type RewriteSummaryRequest = {
  summary_body: string;
  target_role?: string | null;
  job_description?: string | null;
};

export type RewriteSummaryResponse = {
  rewritten_summary: string;
};

export type RewriteExperienceRequest = {
  company: string;
  job_title: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  bullets: string[];
};

export type RewriteExperienceResponse = {
  bullets: string[];
};

export type OptimizePersonalInfoInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
};

export type OptimizeEducationInput = {
  institution: string;
  degree: string;
  field_of_study?: string | null;
};

export type OptimizeSkillCategoryInput = {
  category: string;
  items: string[];
};

export type OptimizeResumeRequest = {
  title: string;
  personal_info?: OptimizePersonalInfoInput | null;
  summary_body?: string | null;
  experiences: RewriteExperienceRequest[];
  educations: OptimizeEducationInput[];
  skills: OptimizeSkillCategoryInput[];
};

export type OptimizeResumeResponse = {
  summary?: string | null;
  experience_bullets: string[][];
  skill_phrases: string[];
  ats_notes: string;
};
