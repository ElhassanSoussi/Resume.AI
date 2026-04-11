import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await getSupabaseBrowserClient().auth.getSession();
  return session;
}

/** Bearer token for `/api/v1` sourced from the current Supabase session. */
export async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.access_token ?? null;
}

export async function clearAccessToken(): Promise<void> {
  await getSupabaseBrowserClient().auth.signOut();
}
