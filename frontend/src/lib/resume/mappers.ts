import type {
  Education,
  Experience,
  PersonalInfo,
  ResumeRead,
  Skill,
  Summary,
} from "@/lib/types/resume";
import type {
  PersonalInfoFormValues,
  ResumeCreateFormValues,
  ResumeFullUpdateFormValues,
} from "@/lib/validation/resume-schema";

function isoDate(d: string | undefined | null): string | null {
  if (!d || d.trim() === "") return null;
  return d;
}

/** Strip empty bullet lines for API */
function cleanBullets(bullets: string[]): string[] {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

export function mapExperienceForApi(
  row: ResumeCreateFormValues["experiences"][number],
): Omit<Experience, "id" | "resume_id" | "created_at" | "updated_at"> {
  return {
    company: row.company,
    job_title: row.job_title,
    location: row.location,
    start_date: row.start_date,
    end_date: row.is_current ? null : isoDate(row.end_date),
    is_current: row.is_current,
    bullets: cleanBullets(row.bullets),
    sort_order: row.sort_order,
  };
}

export function mapEducationForApi(
  row: ResumeCreateFormValues["educations"][number],
): Omit<Education, "id" | "resume_id" | "created_at" | "updated_at"> {
  return {
    institution: row.institution,
    degree: row.degree,
    field_of_study: row.field_of_study,
    location: row.location,
    start_date: row.start_date,
    end_date: isoDate(row.end_date),
    gpa: row.gpa,
    description: row.description,
    sort_order: row.sort_order,
  };
}

export function mapSkillForApi(
  row: ResumeCreateFormValues["skills"][number],
): Omit<Skill, "id" | "resume_id" | "created_at" | "updated_at"> {
  return {
    category: row.category,
    items: row.items.map((s) => s.trim()).filter(Boolean),
    sort_order: row.sort_order,
  };
}

function toPersonalInfoApi(p: PersonalInfoFormValues) {
  const trimUrl = (s: string | null | undefined) => {
    const t = (s ?? "").trim();
    return t === "" ? null : t;
  };
  return {
    first_name: p.first_name.trim(),
    last_name: p.last_name.trim(),
    email: p.email.trim(),
    phone: p.phone.trim() === "" ? null : p.phone.trim(),
    location: p.location.trim() === "" ? null : p.location.trim(),
    website: trimUrl(p.website as string | null | undefined),
    linkedin_url: trimUrl(p.linkedin_url as string | null | undefined),
    github_url: trimUrl(p.github_url as string | null | undefined),
  };
}

/** Defaults for create + full update editor (draft). */
export function getDefaultFullResumeFormValues(): ResumeFullUpdateFormValues {
  return {
    ...getDefaultResumeFormValues(),
    status: "draft",
  };
}

export function getDefaultResumeFormValues(): ResumeCreateFormValues {
  return {
    title: "",
    template_key: "modern",
    personal_info: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin_url: "",
      github_url: "",
    },
    summary: { body: "" },
    experiences: [],
    educations: [],
    skills: [],
  };
}

export function toResumeCreateBody(values: ResumeCreateFormValues) {
  const summary =
    values.summary?.body?.trim() !== ""
      ? { body: values.summary!.body.trim() }
      : undefined;
  const hasPersonal =
    values.personal_info &&
    (values.personal_info.first_name.trim() ||
      values.personal_info.last_name.trim() ||
      values.personal_info.email.trim());
  return {
    title: values.title.trim(),
    template_key: values.template_key,
    personal_info: hasPersonal ? toPersonalInfoApi(values.personal_info!) : undefined,
    summary,
    experiences: values.experiences.map(mapExperienceForApi),
    educations: values.educations.map(mapEducationForApi),
    skills: values.skills.map(mapSkillForApi),
  };
}

export function toResumeFullUpdateBody(values: ResumeFullUpdateFormValues): Record<string, unknown> {
  const summary =
    values.summary?.body?.trim() !== ""
      ? { body: values.summary!.body.trim() }
      : undefined;
  const hasPersonal =
    values.personal_info &&
    (values.personal_info.first_name.trim() ||
      values.personal_info.last_name.trim() ||
      values.personal_info.email.trim());
  return {
    title: values.title.trim(),
    template_key: values.template_key,
    status: values.status,
    personal_info: hasPersonal ? toPersonalInfoApi(values.personal_info!) : undefined,
    summary,
    experiences: values.experiences.map(mapExperienceForApi),
    educations: values.educations.map(mapEducationForApi),
    skills: values.skills.map(mapSkillForApi),
  };
}

function dateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** Map GET resume → default values for react-hook-form */
export function resumeReadToFormValues(r: ResumeRead): ResumeFullUpdateFormValues {
  const personal: PersonalInfo | null = r.personal_info;
  const summary: Summary | null = r.summary;

  return {
    title: r.title,
    template_key: r.template_key,
    status: r.status === "complete" ? "complete" : "draft",
    personal_info: personal
      ? {
        first_name: personal.first_name,
        last_name: personal.last_name,
        email: personal.email,
        phone: personal.phone ?? "",
        location: personal.location ?? "",
        website: personal.website ?? "",
        linkedin_url: personal.linkedin_url ?? "",
        github_url: personal.github_url ?? "",
      }
      : {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin_url: "",
        github_url: "",
      },
    summary: summary ? { body: summary.body } : { body: "" },
    experiences:
      r.experiences?.length > 0
        ? r.experiences.map((e, i) => ({
          company: e.company,
          job_title: e.job_title,
          location: e.location ?? "",
          start_date: dateInput(e.start_date),
          end_date: dateInput(e.end_date),
          is_current: e.is_current,
          bullets: e.bullets?.length ? [...e.bullets] : [""],
          sort_order: e.sort_order ?? i,
        }))
        : [],
    educations:
      r.educations?.length > 0
        ? r.educations.map((ed, i) => ({
          institution: ed.institution,
          degree: ed.degree,
          field_of_study: ed.field_of_study ?? "",
          location: ed.location ?? "",
          start_date: dateInput(ed.start_date),
          end_date: dateInput(ed.end_date),
          gpa: ed.gpa ?? "",
          description: ed.description ?? "",
          sort_order: ed.sort_order ?? i,
        }))
        : [],
    skills:
      r.skills?.length > 0
        ? r.skills.map((s, i) => ({
          category: s.category,
          items: s.items?.length ? [...s.items] : [""],
          sort_order: s.sort_order ?? i,
        }))
        : [],
  };
}
