"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResumeWritingMode } from "@/lib/types/ai";
import type {
  ExperienceLevel,
  ResumeOriginPref,
  UsagePath,
  WorkspaceCareerPrefsV1,
} from "@/lib/onboarding/workspace-preferences";
import {
  loadWorkspaceCareerPrefs,
  saveWorkspaceCareerPrefs,
} from "@/lib/onboarding/workspace-preferences";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";

const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "student", label: "Student / intern" },
  { value: "entry", label: "Entry-level" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior / leadership" },
];

const PATHS: { value: UsagePath; label: string; hint: string }[] = [
  { value: "ats", label: "Mostly ATS uploads", hint: "Application portals and parsers" },
  { value: "recruiter", label: "Mostly recruiter PDFs", hint: "Email, referrals, human-first reads" },
  { value: "both", label: "Both", hint: "We will default conservatively and you can switch per export." },
];

const MODES: { value: ResumeWritingMode; label: string; hint: string }[] = [
  { value: "concise", label: "Concise", hint: "Tighter lines, faster scanning" },
  { value: "balanced", label: "Balanced", hint: "Works for most roles" },
  { value: "achievement_focused", label: "Achievement-focused", hint: "Ownership and outcomes when facts support them" },
  { value: "ats_focused", label: "ATS-focused", hint: "Direct wording for parser-heavy flows" },
];

const ORIGINS: { value: ResumeOriginPref; label: string }[] = [
  { value: "scratch", label: "Starting from scratch" },
  { value: "adapt", label: "Adapting an existing resume" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** First dashboard visit vs updating from settings */
  variant?: "welcome" | "settings";
  /** Fires after preferences are saved (not on skip). */
  onSaved?: () => void;
};

export function WorkspaceOnboardingDialog({ open, onOpenChange, variant = "welcome", onSaved }: Props) {
  const [targetRole, setTargetRole] = useState("");
  const [level, setLevel] = useState<ExperienceLevel>("mid");
  const [path, setPath] = useState<UsagePath>("both");
  const [writingMode, setWritingMode] = useState<ResumeWritingMode>("balanced");
  const [origin, setOrigin] = useState<ResumeOriginPref>("scratch");

  useEffect(() => {
    if (!open) return;
    const existing = loadWorkspaceCareerPrefs();
    if (existing?.completedAt || existing?.skipped) {
      setTargetRole(existing.target_role ?? "");
      setLevel(existing.experience_level ?? "mid");
      setPath(existing.usage_path ?? "both");
      setWritingMode(existing.writing_mode ?? "balanced");
      setOrigin(existing.resume_origin ?? "scratch");
    }
  }, [open]);

  const persist = (patch: Partial<WorkspaceCareerPrefsV1>) => {
    const prev = loadWorkspaceCareerPrefs() ?? { v: 1 as const };
    const next: WorkspaceCareerPrefsV1 = {
      ...prev,
      v: 1,
      ...patch,
    };
    saveWorkspaceCareerPrefs(next);
  };

  const handleSave = () => {
    persist({
      completedAt: new Date().toISOString(),
      skipped: false,
      target_role: targetRole.trim() || undefined,
      experience_level: level,
      usage_path: path,
      writing_mode: writingMode,
      resume_origin: origin,
    });
    track(ANALYTICS_EVENTS.ONBOARDING_COMPLETED);
    onSaved?.();
    onOpenChange(false);
  };

  const handleSkip = () => {
    persist({
      skipped: true,
      completedAt: undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-white/[0.12] bg-card/95 shadow-2xl backdrop-blur-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{variant === "welcome" ? "Quick career setup" : "Career preferences"}</DialogTitle>
          <DialogDescription>
            {variant === "welcome"
              ? "About one minute, optional. Tunes defaults for new resumes, export mode, and AI writing so your first week in the app feels guided — change anytime in Settings."
              : "Tune defaults for new resumes, exports, and AI writing. Saved only in this browser."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="onb-role">Target role (optional)</Label>
            <Input
              id="onb-role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Product Manager, B2B SaaS"
            />
            <p className="text-xs text-muted-foreground">Used as a gentle default for new resume titles — never shared automatically.</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experience level</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LEVELS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLevel(opt.value)}
                  className={[
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    level === opt.value
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                      : "border-white/10 bg-card/40 hover:border-white/20",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Main use</p>
            <div className="space-y-2">
              {PATHS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPath(opt.value)}
                  className={[
                    "flex w-full flex-col rounded-lg border px-3 py-2 text-left text-sm transition",
                    path === opt.value
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                      : "border-white/10 bg-card/40 hover:border-white/20",
                  ].join(" ")}
                >
                  <span className="font-medium text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Default AI writing mode</p>
            <p className="text-xs text-muted-foreground">
              AI rewrites optimize your wording — it does not invent employers, dates, or credentials.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {MODES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setWritingMode(opt.value)}
                  className={[
                    "flex flex-col rounded-lg border px-3 py-2 text-left text-sm transition",
                    writingMode === opt.value
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                      : "border-white/10 bg-card/40 hover:border-white/20",
                  ].join(" ")}
                >
                  <span className="font-medium text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">This resume journey</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ORIGINS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOrigin(opt.value)}
                  className={[
                    "rounded-lg border px-3 py-2 text-left text-sm transition",
                    origin === opt.value
                      ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                      : "border-white/10 bg-card/40 hover:border-white/20",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <div className="flex w-full flex-wrap justify-end gap-2">
            {variant === "welcome" ? (
              <Button type="button" variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            )}
            <Button type="button" onClick={handleSave}>
              Save preferences
            </Button>
          </div>
          <p className="text-center text-[0.7rem] text-muted-foreground">
            Preferences stay in this browser. Export and billing still require your explicit action.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
