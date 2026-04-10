import { api } from "@/lib/api/client";
import type {
  OptimizeResumeRequest,
  OptimizeResumeResponse,
  RewriteExperienceRequest,
  RewriteExperienceResponse,
  RewriteSummaryRequest,
  RewriteSummaryResponse,
} from "@/lib/types/ai";

export async function rewriteSummary(body: RewriteSummaryRequest) {
  return api.post<RewriteSummaryResponse>("/ai/rewrite-summary", body);
}

export async function rewriteExperience(body: RewriteExperienceRequest) {
  return api.post<RewriteExperienceResponse>("/ai/rewrite-experience", body);
}

export async function optimizeResume(body: OptimizeResumeRequest) {
  return api.post<OptimizeResumeResponse>("/ai/optimize-resume", body);
}
