"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageSection } from "@/components/ui/page-section";
import { Textarea } from "@/components/ui/textarea";
import { useTailorResume } from "@/hooks/use-resume-versions";
import { APP_ROUTES } from "@/lib/auth/routes";

type Props = {
  resumeId: string;
  resumeTitle: string;
};

export function ResumeTailorPanel({ resumeId, resumeTitle }: Props) {
  const router = useRouter();
  const tailor = useTailorResume(resumeId);

  const [jobDesc, setJobDesc] = useState("");
  const [label, setLabel] = useState("Tailored Version");
  const [result, setResult] = useState<{ label: string; ats_notes?: string } | null>(null);

  async function handleTailor() {
    if (!jobDesc.trim()) {
      toast.error("Paste a job description first.");
      return;
    }
    try {
      const res = await tailor.mutateAsync({ job_description: jobDesc, label });
      setResult({
        label: res.version.label,
        ats_notes: (res.version.snapshot as Record<string, unknown>).ats_notes as string | undefined,
      });
      toast.success("Tailored version saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tailoring failed.");
    }
  }

  return (
    <PageSection
      eyebrow={resumeTitle}
      title="Tailor for a job"
      description="AI aligns your wording to the role while keeping your facts intact, then saves the result as a separate version."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Job description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tailor-label">Version label</Label>
              <Input
                id="tailor-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Google SWE – Apr 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tailor-jd">Job description</Label>
              <Textarea
                id="tailor-jd"
                rows={14}
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the full job posting here…"
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Paste the full posting when possible so the tailored version can mirror the right language without exaggerating your background.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => void handleTailor()}
              disabled={tailor.isPending}
            >
              {tailor.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 size-4" />
              )}
              {tailor.isPending ? "Tailoring resume…" : "Tailor resume"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Result</CardTitle>
          </CardHeader>
          <CardContent>
            {tailor.isPending && (
              <div className="flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm">AI is adapting your resume…</p>
              </div>
            )}

            {!tailor.isPending && !result && (
              <p className="text-sm text-muted-foreground">
                Your tailored version will appear here after processing. It is saved automatically to version history so your original draft stays untouched.
              </p>
            )}

            {!tailor.isPending && result && (
              <div className="space-y-4">
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3">
                  <p className="text-sm font-medium text-green-400">
                    Version &ldquo;{result.label}&rdquo; saved
                  </p>
                </div>
                {result.ats_notes && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      ATS Notes
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80">{result.ats_notes}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(APP_ROUTES.resumeVersions(resumeId))}
                >
                  View all versions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
