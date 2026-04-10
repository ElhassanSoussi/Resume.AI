/** Mirrors FastAPI `ResumeRead` / nested section schemas (ISO date strings over the wire). */

export type IsoDateString = string;

export type PersonalInfo = {
  id?: string;
  resume_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Summary = {
  id?: string;
  resume_id?: string;
  body: string;
  created_at?: string;
  updated_at?: string;
};

export type Experience = {
  id?: string;
  resume_id?: string;
  company: string;
  job_title: string;
  location: string | null;
  start_date: IsoDateString;
  end_date: IsoDateString | null;
  is_current: boolean;
  bullets: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Education = {
  id?: string;
  resume_id?: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  location: string | null;
  start_date: IsoDateString;
  end_date: IsoDateString | null;
  gpa: string | null;
  description: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type Skill = {
  id?: string;
  resume_id?: string;
  category: string;
  items: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type ResumeRead = {
  id: string;
  user_id: string;
  title: string;
  template_key: string;
  status: string;
  created_at: string;
  updated_at: string;
  personal_info: PersonalInfo | null;
  summary: Summary | null;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
};

export type ResumeListItem = Omit<
  ResumeRead,
  "personal_info" | "summary" | "experiences" | "educations" | "skills"
>;

export type ResumeListResponse = {
  items: ResumeListItem[];
  total: number;
  offset: number;
  limit: number;
};
