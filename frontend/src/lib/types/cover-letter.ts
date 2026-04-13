/** Mirrors FastAPI CoverLetter schemas. */

export type CoverLetterStatus = "draft" | "final";

export type CoverLetter = {
  id: string;
  user_id: string;
  resume_id: string | null;
  title: string;
  company_name: string | null;
  target_role: string | null;
  job_description: string | null;
  body: string;
  status: CoverLetterStatus;
  created_at: string;
  updated_at: string;
};

export type CoverLetterListItem = Omit<CoverLetter, "body" | "job_description">;

export type CoverLetterListResponse = {
  items: CoverLetterListItem[];
  total: number;
  offset: number;
  limit: number;
};

export type CoverLetterCreate = {
  title: string;
  resume_id?: string | null;
  company_name?: string | null;
  target_role?: string | null;
  job_description?: string | null;
  body?: string;
  status?: CoverLetterStatus;
};

export type CoverLetterUpdate = Partial<CoverLetterCreate>;

export type CoverLetterTone = "professional" | "direct" | "warm";

export type GenerateCoverLetterRequest = {
  resume_id: string;
  company_name?: string | null;
  target_role?: string | null;
  job_description: string;
  title?: string;
  tone?: CoverLetterTone;
};

export type GenerateCoverLetterResponse = {
  cover_letter: CoverLetter;
};
