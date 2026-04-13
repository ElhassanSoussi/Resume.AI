/** Mirrors FastAPI ResumeVersion schemas. */

export type ResumeVersionSnapshot = Record<string, unknown>;

export type ResumeVersion = {
  id: string;
  resume_id: string;
  user_id: string;
  label: string;
  snapshot: ResumeVersionSnapshot;
  is_tailored: boolean;
  job_description: string | null;
  source_version_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ResumeVersionListItem = Omit<ResumeVersion, "snapshot" | "job_description">;

export type ResumeVersionListResponse = {
  items: ResumeVersionListItem[];
  total: number;
};

export type ResumeVersionUpdate = {
  label?: string;
};

export type TailorResumeRequest = {
  job_description: string;
  label?: string;
};

export type TailorResumeResponse = {
  version: ResumeVersion;
};
