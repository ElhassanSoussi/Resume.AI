/**
 * Lightweight career preferences stored locally (no new backend surface).
 * Drives defaults for new resumes, export mode, AI writing mode, and dashboard hints.
 */

import type { ResumeWritingMode } from "@/lib/types/ai";
import type { ResumeExportMode, ResumeTemplateId } from "@/lib/resume/constants";
import {
  DEFAULT_EXPORT_MODE,
  DEFAULT_RESUME_TEMPLATE,
  normalizeResumeExportMode,
  normalizeResumeTemplateKey,
} from "@/lib/resume/constants";

const STORAGE_KEY = "resumeforge_workspace_prefs_v1";

export type ExperienceLevel = "student" | "entry" | "mid" | "senior";

export type UsagePath = "ats" | "recruiter" | "both";

export type ResumeOriginPref = "scratch" | "adapt";

export type WorkspaceCareerPrefsV1 = {
  v: 1;
  /** User chose "Skip" on first prompt without filling the form */
  skipped?: boolean;
  /** Set when user saves the form */
  completedAt?: string;
  target_role?: string;
  experience_level?: ExperienceLevel;
  usage_path?: UsagePath;
  writing_mode?: ResumeWritingMode;
  resume_origin?: ResumeOriginPref;
};

export function loadWorkspaceCareerPrefs(): WorkspaceCareerPrefsV1 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceCareerPrefsV1;
    if (parsed?.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveWorkspaceCareerPrefs(prefs: WorkspaceCareerPrefsV1): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearWorkspaceCareerPrefs(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** First visit: no saved decision yet */
export function shouldPromptWorkspaceOnboarding(): boolean {
  const p = loadWorkspaceCareerPrefs();
  return p == null;
}

export function hasCompletedWorkspaceOnboarding(): boolean {
  const p = loadWorkspaceCareerPrefs();
  return Boolean(p?.completedAt);
}

export function suggestedTemplateKey(prefs: WorkspaceCareerPrefsV1 | null): ResumeTemplateId {
  if (!prefs) return DEFAULT_RESUME_TEMPLATE;
  if (prefs.usage_path === "ats") {
    return normalizeResumeTemplateKey("ats_classic");
  }
  switch (prefs.experience_level) {
    case "student":
      return normalizeResumeTemplateKey("graduate_starter");
    case "senior":
      return normalizeResumeTemplateKey("executive_serif");
    case "entry":
      return normalizeResumeTemplateKey("modern_professional");
    case "mid":
    default:
      return normalizeResumeTemplateKey("corporate_minimal");
  }
}

export function suggestedExportMode(prefs: WorkspaceCareerPrefsV1 | null): ResumeExportMode {
  if (!prefs) return DEFAULT_EXPORT_MODE;
  if (prefs.usage_path === "ats") return normalizeResumeExportMode("ats");
  if (prefs.usage_path === "recruiter") return normalizeResumeExportMode("designed");
  return normalizeResumeExportMode("ats");
}

export function suggestedWritingMode(prefs: WorkspaceCareerPrefsV1 | null): ResumeWritingMode {
  if (prefs?.writing_mode) return prefs.writing_mode;
  if (!prefs) return "balanced";
  if (prefs.usage_path === "ats") return "ats_focused";
  if (prefs.experience_level === "senior") return "achievement_focused";
  if (prefs.experience_level === "student" || prefs.experience_level === "entry") return "concise";
  return "balanced";
}

/** Short hints for dashboard “next steps” copy */
export function workflowHintsFromPrefs(prefs: WorkspaceCareerPrefsV1 | null): string[] {
  if (!prefs?.completedAt) return [];
  const hints: string[] = [];
  if (prefs.usage_path === "ats" || prefs.usage_path === "both") {
    hints.push("Preview in ATS mode before portal uploads.");
  }
  if (prefs.usage_path === "recruiter" || prefs.usage_path === "both") {
    hints.push("Designed export reads strongest when shared directly with people.");
  }
  if (prefs.resume_origin === "adapt") {
    hints.push("Paste your legacy bullets, then run Optimize to tighten without changing facts.");
  }
  return hints;
}
