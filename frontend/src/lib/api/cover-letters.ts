import { api } from "@/lib/api/client";
import type {
  CoverLetter,
  CoverLetterCreate,
  CoverLetterListResponse,
  CoverLetterUpdate,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
} from "@/lib/types/cover-letter";

export function listCoverLetters(params: { offset?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.offset != null) qs.set("offset", String(params.offset));
  if (params.limit != null) qs.set("limit", String(params.limit));
  const q = qs.toString();
  const url = q ? `/cover-letters/?${q}` : "/cover-letters/";
  return api.get<CoverLetterListResponse>(url);
}

export function getCoverLetter(id: string) {
  return api.get<CoverLetter>(`/cover-letters/${id}`);
}

export function createCoverLetter(body: CoverLetterCreate) {
  return api.post<CoverLetter>("/cover-letters/", body);
}

export function updateCoverLetter(id: string, body: CoverLetterUpdate) {
  return api.patch<CoverLetter>(`/cover-letters/${id}`, body);
}

export function deleteCoverLetter(id: string) {
  return api.delete<{ message: string }>(`/cover-letters/${id}`);
}

export function generateCoverLetter(body: GenerateCoverLetterRequest) {
  return api.post<GenerateCoverLetterResponse>("/cover-letters/generate", body);
}
