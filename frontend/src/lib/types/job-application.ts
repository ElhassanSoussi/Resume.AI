/** Mirrors FastAPI JobApplication schemas. */

export type JobStatus = "applied" | "interview" | "offer" | "rejected";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  applied: "bg-blue-500/15 text-blue-400",
  interview: "bg-yellow-500/15 text-yellow-400",
  offer: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

export type JobApplication = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: JobStatus;
  job_description: string | null;
  notes: string | null;
  applied_date: string | null;
  resume_version_id: string | null;
  cover_letter_id: string | null;
  created_at: string;
  updated_at: string;
};

export type JobApplicationCreate = {
  company: string;
  role: string;
  status?: JobStatus;
  job_description?: string | null;
  notes?: string | null;
  applied_date?: string | null;
  resume_version_id?: string | null;
  cover_letter_id?: string | null;
};

export type JobApplicationUpdate = Partial<JobApplicationCreate>;

export type JobApplicationListResponse = {
  items: JobApplication[];
  total: number;
  offset: number;
  limit: number;
};
