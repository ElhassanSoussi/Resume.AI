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
} as const;

export const APP_ROUTES = {
  dashboard: "/dashboard",
  resumeNew: "/resumes/new",
  resumeEdit: (id: string) => `/resumes/${id}/edit` as const,
  resumePreview: (id: string) => `/resumes/${id}/preview` as const,
  billing: "/billing",
  settings: "/settings",
} as const;

/** Prefixes matched by `middleware` for session checks. */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/resumes",
  "/billing",
  "/settings",
] as const;
