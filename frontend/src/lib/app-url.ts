/** Browser origin for Stripe return URLs (client-only checkout). */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}
