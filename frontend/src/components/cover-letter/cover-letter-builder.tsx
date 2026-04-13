"use client";

import { useState } from "react";
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
import type { CoverLetter } from "@/lib/types/cover-letter";
import type { ResumeListItem } from "@/lib/types/resume";

type Props = {
  resumes: ResumeListItem[];
  initial?: CoverLetter;
};

export function CoverLetterBuilder({ resumes, initial }: Props) {
  // All hooks must be declared unconditionally before any early return.
  const router = useRouter();
  const generate = useGenerateCoverLetter();
  const update = useUpdateCoverLetter(initial?.id ?? "");

  const [resumeId, setResumeId] = useState(initial?.resume_id ?? resumes[0]?.id ?? "");
  const [company, setCompany] = useState(initial?.company_name ?? "");
  const [role, setRole] = useState(initial?.target_role ?? "");
  const [jobDesc, setJobDesc] = useState(initial?.job_description ?? "");
  const [title, setTitle] = useState(initial?.title ?? "Cover Letter");
  const [body, setBody] = useState(initial?.body ?? "");

  const isEditing = Boolean(initial);

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
      });
      setBody(res.cover_letter.body);
      toast.success("Cover letter generated!");
      if (!isEditing) {
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
      description="Generate a tailored draft from your resume and the role, then refine the final version before you send it."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left: inputs */}
        <div className="space-y-5">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Letter brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <Button
                className="w-full"
                onClick={() => void handleGenerate()}
                disabled={generate.isPending}
              >
                {generate.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 size-4" />
                )}
                {generate.isPending ? "Generating draft…" : "Generate draft"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: editor */}
        <div className="space-y-4">
          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center gap-2">
              <FileText className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Draft editor</CardTitle>
              {generate.isPending && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 animate-pulse text-primary" />
                  AI writing…
                </span>
              )}
            </CardHeader>
            <CardContent>
              <Textarea
                rows={22}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Your draft appears here after generation. Edit freely before you send it."
                className="resize-none font-mono text-sm"
              />
            </CardContent>
          </Card>

          {isEditing && body && (
            <div className="flex justify-end">
              <Button onClick={() => void handleSave()} disabled={update.isPending}>
                {update.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Save changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageSection>
  );
}
