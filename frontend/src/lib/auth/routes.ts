/**
 * Central route registry for marketing vs. authenticated app vs. auth flows.
 * Middleware and guards can import these constants.
 */

export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
} as const;

export const MARKETING_ROUTES = {
  home: "/",
  pricing: "/pricing",
  examples: "/examples",
  privacy: "/privacy",
  terms: "/terms",
  support: "/support",
} as const;

export const APP_ROUTES = {
  dashboard: "/dashboard",
  resumeNew: "/resumes/new",
  resumeEdit: (id: string) => `/resumes/${id}/edit` as const,
  resumePreview: (id: string) => `/resumes/${id}/preview` as const,
  resumeVersions: (id: string) => `/resumes/${id}/versions` as const,
  resumeTailor: (id: string) => `/resumes/${id}/tailor` as const,
  coverLetters: "/cover-letters",
  coverLetterNew: "/cover-letters/new",
  coverLetterDetail: (id: string) => `/cover-letters/${id}` as const,
  jobs: "/jobs",
  billing: "/billing",
  settings: "/settings",
} as const;

/** Prefixes matched by `middleware` for session checks. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/resumes",
  "/cover-letters",
  "/jobs",
  "/billing",
  "/settings",
] as const;
