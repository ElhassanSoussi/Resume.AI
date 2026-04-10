"use client";

import { useMutation } from "@tanstack/react-query";

import * as aiApi from "@/lib/api/ai";
import type {
  OptimizeResumeRequest,
  RewriteExperienceRequest,
  RewriteSummaryRequest,
} from "@/lib/types/ai";

/**
 * AI resume mutations with shared pending state — disable all AI controls while any request runs
 * to prevent duplicate / overlapping calls.
 */
export function useAiResumeMutations() {
  const rewriteSummary = useMutation({
    mutationFn: (body: RewriteSummaryRequest) => aiApi.rewriteSummary(body),
  });

  const rewriteExperience = useMutation({
    mutationFn: (body: RewriteExperienceRequest) => aiApi.rewriteExperience(body),
  });

  const optimizeResume = useMutation({
    mutationFn: (body: OptimizeResumeRequest) => aiApi.optimizeResume(body),
  });

  const aiBusy =
    rewriteSummary.isPending || rewriteExperience.isPending || optimizeResume.isPending;

  return {
    rewriteSummary,
    rewriteExperience,
    optimizeResume,
    aiBusy,
  };
}
