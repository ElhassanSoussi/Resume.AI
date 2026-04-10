import { z } from "zod";

/** Optional HTTP(S) URL or empty → null */
const optionalHttpUrlField = z
  .union([z.literal(""), z.string()])
  .transform((s) => (s.trim() === "" ? null : s.trim()))
  .refine((v) => v === null || z.url().safeParse(v).success, "Enter a valid URL or leave blank");

export const personalInfoFormSchema = z.object({
  first_name: z.string().min(1, "Required").max(100),
  last_name: z.string().min(1, "Required").max(100),
  email: z.email("Valid email required"),
  phone: z.string().max(50),
  location: z.string().max(255),
  website: optionalHttpUrlField,
  linkedin_url: optionalHttpUrlField,
  github_url: optionalHttpUrlField,
});

export const summaryFormSchema = z.object({
  body: z.string().min(1, "Add a short summary").max(5000),
});

export const experienceRowSchema = z
  .object({
    company: z.string().min(1, "Company required").max(255),
    job_title: z.string().min(1, "Title required").max(255),
    location: z
      .union([z.literal(""), z.string().max(255)])
      .transform((s) => (typeof s === "string" && s.trim() === "" ? null : s.trim() || null)),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.union([z.literal(""), z.string()]),
    is_current: z.boolean(),
    bullets: z.array(z.string()),
    sort_order: z.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.is_current && data.end_date) {
      ctx.addIssue({
        code: "custom",
        message: "Uncheck “current” or clear end date",
        path: ["end_date"],
      });
    }
    if (
      !data.is_current &&
      data.end_date &&
      data.start_date &&
      data.end_date < data.start_date
    ) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be on or after start date",
        path: ["end_date"],
      });
    }
  });

export const educationRowSchema = z
  .object({
    institution: z.string().min(1, "School required").max(255),
    degree: z.string().min(1, "Degree required").max(255),
    field_of_study: z
      .union([z.literal(""), z.string().max(255)])
      .transform((s) => (typeof s === "string" && s.trim() === "" ? null : s.trim() || null)),
    location: z
      .union([z.literal(""), z.string().max(255)])
      .transform((s) => (typeof s === "string" && s.trim() === "" ? null : s.trim() || null)),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.union([z.literal(""), z.string()]),
    gpa: z
      .union([z.literal(""), z.string().max(20)])
      .transform((s) => (typeof s === "string" && s.trim() === "" ? null : s.trim() || null)),
    description: z
      .union([z.literal(""), z.string()])
      .transform((s) => (typeof s === "string" && s.trim() === "" ? null : s.trim() || null)),
    sort_order: z.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.end_date && data.start_date && data.end_date < data.start_date) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be on or after start date",
        path: ["end_date"],
      });
    }
  });

export const skillRowSchema = z.object({
  category: z.string().min(1).max(100),
  items: z.array(z.string()).min(1, "Add at least one skill"),
  sort_order: z.number().int(),
});

export const resumeCreateSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  template_key: z.string().min(1).max(100),
  personal_info: personalInfoFormSchema.nullable().optional(),
  summary: summaryFormSchema.nullable().optional(),
  experiences: z.array(experienceRowSchema),
  educations: z.array(educationRowSchema),
  skills: z.array(skillRowSchema),
});

export const resumeFullUpdateSchema = resumeCreateSchema.extend({
  status: z.enum(["draft", "complete"]),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoFormSchema>;
export type ResumeCreateFormValues = z.infer<typeof resumeCreateSchema>;
export type ResumeFullUpdateFormValues = z.infer<typeof resumeFullUpdateSchema>;
