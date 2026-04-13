"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/components/ui/page-section";
import { useGenerateCoverLetter, useUpdateCoverLetter } from "@/hooks/use-cover-letters";
import { APP_ROUTES } from "@/lib/auth/routes";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics/track";
import type { CoverLetter, CoverLetterTone } from "@/lib/types/cover-letter";
import type { ResumeListItem } from "@/lib/types/resume";

type Props = {
  resumes: ResumeListItem[];
  initial?: CoverLetter;
};

const TONE_OPTIONS: { value: CoverLetterTone; label: string; hint: string }[] = [
  { value: "professional", label: "Professional", hint: "Confident, restrained, boardroom-safe" },
  { value: "direct", label: "Direct", hint: "Efficient sentences, minimal flourish" },
  { value: "warm", label: "Warm", hint: "Personable while staying credible" },
];

export function CoverLetterBuilder({ resumes, initial }: Props) {
  const router = useRouter();
  const generate = useGenerateCoverLetter();
  const update = useUpdateCoverLetter(initial?.id ?? "");

  const [resumeId, setResumeId] = useState(initial?.resume_id ?? resumes[0]?.id ?? "");
  const [company, setCompany] = useState(initial?.company_name ?? "");
  const [role, setRole] = useState(initial?.target_role ?? "");
  const [jobDesc, setJobDesc] = useState(initial?.job_description ?? "");
  const [title, setTitle] = useState(initial?.title ?? "Cover Letter");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tone, setTone] = useState<CoverLetterTone>("professional");

  const isEditing = Boolean(initial);

  const resumeTitle = useMemo(
    () => resumes.find((r) => r.id === resumeId)?.title ?? "Selected resume",
    [resumeId, resumes],
  );

  if (resumes.length === 0) {
    return (
      <PageSection
        eyebrow="Cover Letters"
        title="Start with a resume"
        description="A cover letter uses your existing resume as source material, so the workspace needs at least one resume first."
      >
        <Button asChild>
          <a href="/resumes/new">Create a resume first</a>
        </Button>
      </PageSection>
    );
  }

  async function handleGenerate() {
    if (!resumeId || !jobDesc.trim()) {
      toast.error("Select a resume and paste a job description.");
      return;
    }
    try {
      const res = await generate.mutateAsync({
        resume_id: resumeId,
        company_name: company || null,
        target_role: role || null,
        job_description: jobDesc,
        title,
        tone,
      });
      setBody(res.cover_letter.body);
      track(ANALYTICS_EVENTS.COVER_LETTER_CREATED, {
        cover_letter_id: res.cover_letter.id,
        resume_id: resumeId,
      });
      if (isEditing) {
        toast.success("New draft saved to your library.", {
          description: "The API creates a fresh letter each time. Older drafts stay listed until you remove them.",
        });
        router.replace(APP_ROUTES.coverLetterDetail(res.cover_letter.id));
      } else {
        toast.success("Cover letter generated!");
        router.push(APP_ROUTES.coverLetterDetail(res.cover_letter.id));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed.");
    }
  }

  async function handleSave() {
    if (!initial) return;
    try {
      await update.mutateAsync({
        body,
        title,
        company_name: company.trim() || null,
        target_role: role.trim() || null,
        job_description: jobDesc.trim() || null,
      });
      toast.success("Cover letter saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <PageSection
      eyebrow="Cover Letters"
      title={isEditing ? title : "New Cover Letter"}
      description="A strong letter connects two roles: yours (from the resume) and theirs (from the posting). AI tightens language — it does not invent employers, titles, or credentials you did not provide."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Letter brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground/90">What the draft should do</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Open with why this role and company fit your direction.</li>
                  <li>Bridge 1–2 proof points from your resume to their needs.</li>
                  <li>Close with a calm call to action — no hard sell.</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cl-title">Title</Label>
                <Input
                  id="cl-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cover Letter – Google SWE"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cl-resume">Resume</Label>
                <select
                  id="cl-resume"
                  aria-label="Select resume"
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cl-company">Company</Label>
                <Input
                  id="cl-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cl-role">Target role</Label>
                <Input
                  id="cl-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Senior Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tone</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TONE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTone(opt.value)}
                      className={[
                        "flex flex-col rounded-lg border px-2.5 py-2 text-left text-xs transition",
                        tone === opt.value
                          ? "border-primary/60 bg-primary/10 ring-1 ring-primary/20"
                          : "border-white/10 bg-card/40 hover:border-white/20",
                      ].join(" ")}
                    >
                      <span className="font-medium text-foreground">{opt.label}</span>
                      <span className="mt-0.5 text-[0.68rem] text-muted-foreground">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cl-jd">Job description</Label>
                <p className="text-xs text-muted-foreground">
                  Paste enough of the role description for the draft to sound specific and credible.
                </p>
                <Textarea
                  id="cl-jd"
                  rows={8}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here…"
                  className="resize-none"
                />
              </div>

              <Button className="w-full" onClick={() => void handleGenerate()} disabled={generate.isPending}>
                {generate.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 size-4" />
                )}
                {generate.isPending ? "Generating draft…" : isEditing && body ? "Regenerate from brief" : "Generate draft"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {(company.trim() || role.trim()) && (
            <div className="flex flex-wrap gap-2 text-[0.72rem] text-muted-foreground">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                Resume: <span className="text-foreground/90">{resumeTitle}</span>
              </span>
              {company.trim() ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  Company: <span className="text-foreground/90">{company.trim()}</span>
                </span>
              ) : null}
              {role.trim() ? (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                  Role: <span className="text-foreground/90">{role.trim()}</span>
                </span>
              ) : null}
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                Tone: <span className="text-foreground/90">{TONE_OPTIONS.find((t) => t.value === tone)?.label}</span>
              </span>
            </div>
          )}

          <Card className="glass-panel">
            <CardHeader className="flex flex-row flex-wrap items-center gap-2">
              <FileText className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Draft editor</CardTitle>
              {generate.isPending && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 animate-pulse text-primary" />
                  AI writing…
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                rows={22}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Your draft appears here after generation. Edit freely before you send it."
                className="resize-none font-mono text-sm"
              />
              {isEditing && body ? (
                <p className="text-xs text-muted-foreground">
                  Regenerate replaces the draft text using your current brief and tone. Save when you are happy with edits.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {isEditing && body ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button onClick={() => void handleSave()} disabled={update.isPending}>
                {update.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </PageSection>
  );
}
