import { api } from "@/lib/api/client";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  PaymentRead,
  ResumePaymentStatus,
} from "@/lib/types/billing";

export async function listPayments(params?: { offset?: number; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.limit != null) search.set("limit", String(params.limit));
  const q = search.toString();
  return api.get<PaymentRead[]>(`/payments${q ? `?${q}` : ""}`);
}

export async function getResumePaymentStatus(resumeId: string) {
  return api.get<ResumePaymentStatus>(`/payments/status/${resumeId}`);
}

export async function createCheckoutSession(body: CreateCheckoutSessionRequest) {
  return api.post<CreateCheckoutSessionResponse>("/payments/create-checkout-session", body);
}
