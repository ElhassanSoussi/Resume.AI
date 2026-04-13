import { getSupportEmail } from "@/lib/support";

/** Optional HTTPS form (Typeform, Google Forms, etc.) for structured beta feedback. */
export function getBetaFeedbackFormUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BETA_FEEDBACK_URL?.trim();
  if (!raw) return null;
  if (raw.startsWith("https://") || raw.startsWith("http://")) return raw;
  return null;
}

/** Prefilled mailto for quick beta notes when support email is configured. */
export function buildBetaFeedbackMailto(): string | null {
  const email = getSupportEmail();
  if (!email) return null;
  const subject = encodeURIComponent("ResumeForge AI — closed beta feedback");
  const body = encodeURIComponent(
    "What you tried:\n\nWhat happened:\n\nBlocking / annoying / idea:\n\nBrowser (if relevant):\n",
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}
