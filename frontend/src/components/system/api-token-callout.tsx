"use client";

import { getAccessToken } from "@/lib/auth/token";

/**
 * Shown when the SPA has no JWT in localStorage — single source of truth for this message.
 */
export function ApiTokenCallout() {
  if (getAccessToken()) return null;
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm leading-relaxed text-amber-100/95"
    >
      <p>
        <span className="font-medium text-amber-50">Authentication required.</span>{" "}
        Set <code className="rounded-md bg-black/25 px-1.5 py-0.5 font-mono text-xs">resumeforge_access_token</code>{" "}
        in localStorage after sign-in so API calls include a Bearer token.
      </p>
    </div>
  );
}
