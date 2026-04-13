"use client";

import { useState } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAiResumeMutations } from "@/hooks/use-ai-resume";
import { applyOptimizeResult } from "@/lib/ai/apply-optimize";
import { resumeFormToOptimizeRequest } from "@/lib/ai/payloads";
import { ApiError } from "@/lib/api/client";
import type { ResumeFullUpdateFormValues } from "@/lib/validation/resume-schema";

export type AiResumeMutations = ReturnType<typeof useAiResumeMutations>;

type Props = {
  getValues: UseFormGetValues<ResumeFullUpdateFormValues>;
  setValue: UseFormSetValue<ResumeFullUpdateFormValues>;
  ai: AiResumeMutations;
};

export function ResumeAiPanel({ getValues, setValue, ai }: Props) {
  const { rewriteSummary, optimizeResume, aiBusy } = ai;

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [atsOpen, setAtsOpen] = useState(false);
  const [atsNotes, setAtsNotes] = useState("");

  const [localError, setLocalError] = useState<string | null>(null);

  const runSummary = () => {
    setLocalError(null);
    const body = getValues("summary.body")?.trim() ?? "";
    if (!body) {
      setLocalError("Add summary text before running AI rewrite.");
      return;
    }
    rewriteSummary.mutate(
      {
        summary_body: body,
        target_role: targetRole.trim() || null,
        job_description: jobDescription.trim() || null,
      },
      {
        onSuccess: (res) => {
          setValue("summary.body", res.rewritten_summary, { shouldDirty: true, shouldTouch: true });
          setSummaryOpen(false);
        },
      },
    );
  };

  const runFullOptimize = () => {
    setLocalError(null);
    try {
      const values = getValues();
      const payload = resumeFormToOptimizeRequest(values);
      optimizeResume.mutate(payload, {
        onSuccess: (res) => {
          applyOptimizeResult(res, setValue, getValues);
          setOptimizeOpen(false);
          if (res.ats_notes?.trim()) {
            setAtsNotes(res.ats_notes.trim());
            setAtsOpen(true);
          }
        },
      });
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Could not build optimize request.");
    }
  };

  const err =
    localError ??
    (rewriteSummary.error instanceof ApiError ? rewriteSummary.error.message : null) ??
    (optimizeResume.error instanceof ApiError ? optimizeResume.error.message : null);

  return (
    <div className="space-y-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-muted/30 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">AI optimization</h3>
          <p className="text-xs text-muted-foreground">
            Rewrites use your facts only. One operation at a time.
          </p>
        </div>
        {aiBusy ? (
          <span className="inline-flex items-center gap-2 text-xs text-primary">
            <Loader2 className="size-3.5 animate-spin" />
            Working…
          </span>
        ) : null}
      </div>

      {err ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {err}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={aiBusy}
          onClick={() => {
            setLocalError(null);
            setSummaryOpen(true);
          }}
        >
          <Sparkles className="mr-1.5 size-3.5" />
          Rewrite summary
        </Button>
        <Button
          type="button"
          size="sm"
          variant="default"
          disabled={aiBusy}
          onClick={() => {
            setLocalError(null);
            setOptimizeOpen(true);
          }}
        >
          <Wand2 className="mr-1.5 size-3.5" />
          Full resume optimize
        </Button>
      </div>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Rewrite summary</DialogTitle>
            <DialogDescription>
              Optional context helps tailor tone. Your original summary is sent as the only source of facts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ai-target-role">Target role (optional)</Label>
              <input
                id="ai-target-role"
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Product Designer"
                disabled={aiBusy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-job-desc">Job description (optional)</Label>
              <Textarea
                id="ai-job-desc"
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a job post to align keywords…"
                disabled={aiBusy}
                className="resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSummaryOpen(false)} disabled={aiBusy}>
              Cancel
            </Button>
            <Button type="button" onClick={runSummary} disabled={aiBusy}>
              {rewriteSummary.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Rewriting…
                </>
              ) : (
                "Apply rewrite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={optimizeOpen} onOpenChange={setOptimizeOpen}>
        <DialogContent className="max-w-md border-white/10 bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Optimize entire resume</DialogTitle>
            <DialogDescription>
              Runs an ATS-oriented pass on summary bullets, experience bullets, and skills. No new facts are
              invented — review and edit freely after.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOptimizeOpen(false)} disabled={aiBusy}>
              Cancel
            </Button>
            <Button type="button" onClick={runFullOptimize} disabled={aiBusy}>
              {optimizeResume.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Optimizing…
                </>
              ) : (
                "Run optimization"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={atsOpen} onOpenChange={setAtsOpen}>
        <DialogContent className="max-w-lg border-white/10 bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>ATS notes</DialogTitle>
            <DialogDescription>Short guidance from the model — use alongside your own judgment.</DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap rounded-lg border border-white/10 bg-muted/30 p-3 text-sm leading-relaxed">
            {atsNotes}
          </p>
          <DialogFooter>
            <Button type="button" onClick={() => setAtsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
