import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

export type ResumeCoachSignal = {
  severity: "warning" | "note";
  section: "summary" | "experience" | "education" | "skills" | "workflow";
  title: string;
  detail: string;
};

export type ResumeCoachSnapshot = {
  signals: ResumeCoachSignal[];
  strengths: string[];
};

const WEAK_BULLET_OPENERS = new Set([
  "responsible",
  "worked",
  "helped",
  "assisted",
  "participated",
  "supported",
]);

function cleanLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function analyzeResumeCoaching(values: ResumeFullUpdateFormValues): ResumeCoachSnapshot {
  const signals: ResumeCoachSignal[] = [];
  const strengths: string[] = [];

  const summary = values.summary?.body?.trim() ?? "";
  const experiences = values.experiences ?? [];
  const educations = values.educations ?? [];
  const skills = values.skills ?? [];

  if (!summary) {
    signals.push({
      severity: "warning",
      section: "summary",
      title: "Add a professional summary",
      detail: "A concise opening helps recruiters understand your level, direction, and strengths in seconds.",
    });
  } else if (wordCount(summary) < 28) {
    signals.push({
      severity: "note",
      section: "summary",
      title: "Summary could feel more complete",
      detail: "Aim for 2-4 sentences that clarify role focus, strengths, and the kind of work you do best.",
    });
  } else {
    strengths.push("The summary has enough substance to support a polished opening section.");
  }

  if (!experiences.length) {
    signals.push({
      severity: "warning",
      section: "experience",
      title: "Experience section is still empty",
      detail: "Even one well-written role creates far more confidence than an unfinished work history.",
    });
  } else {
    const missingDates = experiences.filter((experience) => !experience.start_date || (!experience.is_current && !experience.end_date));
    const lightBulletRoles = experiences.filter((experience) => cleanLines(experience.bullets).length < 2);
    const vagueRoles = experiences.filter((experience) => {
      const bullets = cleanLines(experience.bullets);
      if (!bullets.length) return false;
      return bullets.every((bullet) => {
        const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
        return wordCount(bullet) < 8 || WEAK_BULLET_OPENERS.has(firstWord);
      });
    });

    if (missingDates.length) {
      signals.push({
        severity: "warning",
        section: "experience",
        title: "Some experience entries are missing dates",
        detail: "Complete dates make the document feel more reliable and prevent timeline questions later.",
      });
    }

    if (lightBulletRoles.length) {
      signals.push({
        severity: "note",
        section: "experience",
        title: "A few roles need more bullet depth",
        detail: "Try to give each recent role at least 2-4 bullets with action, scope, and outcome when facts support it.",
      });
    }

    if (vagueRoles.length) {
      signals.push({
        severity: "note",
        section: "experience",
        title: "Some bullets still read as vague",
        detail: "Replace generic lines with what you owned, improved, delivered, or supported in clearer language.",
      });
    }

    if (!missingDates.length && !lightBulletRoles.length && !vagueRoles.length) {
      strengths.push("Experience entries look structured enough for a recruiter-friendly pass.");
    }
  }

  if (!educations.length && experiences.length <= 1) {
    signals.push({
      severity: "note",
      section: "education",
      title: "Education may still help this version",
      detail: "Early-career resumes usually benefit from a visible education section, even if it stays concise.",
    });
  } else if (educations.length) {
    strengths.push("Education is present, which helps grounding for recruiters and ATS systems.");
  }

  if (!skills.length) {
    signals.push({
      severity: "warning",
      section: "skills",
      title: "Skills are not grouped yet",
      detail: "Add a few focused skill groups so tools, domains, and methods are easy to scan.",
    });
  } else {
    const blankCategories = skills.filter((skill) => !skill.category.trim());
    const oversizedGroups = skills.filter((skill) => cleanLines(skill.items).length > 10);
    if (blankCategories.length) {
      signals.push({
        severity: "note",
        section: "skills",
        title: "Skill groups need clearer labels",
        detail: "Use categories like Product, Languages, Analytics, or Tools so the section scans more professionally.",
      });
    }
    if (oversizedGroups.length) {
      signals.push({
        severity: "note",
        section: "skills",
        title: "One skill group is carrying too much",
        detail: "Break long lists into smaller categories to make the section easier to read and more credible.",
      });
    }
    if (!blankCategories.length && !oversizedGroups.length) {
      strengths.push("Skills are grouped clearly enough to support clean scanning and stronger keyword coverage.");
    }
  }

  if (!signals.length) {
    strengths.push("This draft is structurally strong enough to move into tailoring, preview review, and export.");
  }

  return {
    signals: signals.slice(0, 6),
    strengths: strengths.slice(0, 3),
  };
}
