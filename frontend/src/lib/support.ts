/** Public support contact — set `NEXT_PUBLIC_SUPPORT_EMAIL` in production. */
export function getSupportEmail(): string | null {
  const v = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  return v && v.includes("@") ? v : null;
}
