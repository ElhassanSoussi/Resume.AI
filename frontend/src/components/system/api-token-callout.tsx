"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth/token";

/**
 * Shown when the SPA has no JWT in localStorage — single source of truth for this message.
 */
export function ApiTokenCallout() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkToken = async () => {
      const token = await getAccessToken();
      if (mounted) {
        setVisible(token == null);
      }
    };

    void checkToken();

    return () => {
      mounted = false;
    };
  }, []);

  if (!visible) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="block rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm leading-relaxed text-amber-100/95"
    >
      <p>
        <span className="font-medium text-amber-50">Authentication required.</span>{" "}
        Sign in with your Supabase-backed account so API calls include a Bearer token.
      </p>
    </aside>
  );
}
