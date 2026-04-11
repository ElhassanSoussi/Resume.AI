import type { AuthError, Session, User } from "@supabase/supabase-js";

import { apiFetch } from "@/lib/api/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type UserRead = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type RegisterResult = {
  user: UserRead | null;
  session: TokenPair | null;
  emailConfirmationRequired: boolean;
};

function mapUser(user: User | null): UserRead | null {
  if (user == null) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    full_name:
      typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : null,
  };
}

function mapSession(session: Session | null): TokenPair | null {
  if (session == null) {
    return null;
  }

  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: session.token_type,
  };
}

function throwAuthError(error: AuthError | null): void {
  if (error != null) {
    if (/invalid api key/i.test(error.message)) {
      throw new Error(
        "Invalid Supabase public key. Verify NEXT_PUBLIC_SUPABASE_URL matches the project for NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
    }
    throw error;
  }
}

async function syncAuthenticatedUser(): Promise<void> {
  await apiFetch<UserRead>("/auth/sync", {
    method: "POST",
  });
}

export async function registerUser(body: {
  email: string;
  password: string;
  full_name: string;
}): Promise<RegisterResult> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email: body.email,
    password: body.password,
    options: {
      data: {
        full_name: body.full_name,
      },
    },
  });

  throwAuthError(error);

  if (data.session != null) {
    try {
      await syncAuthenticatedUser();
    } catch (syncError) {
      await supabase.auth.signOut();
      throw syncError;
    }
  }

  return {
    user: mapUser(data.user),
    session: mapSession(data.session),
    emailConfirmationRequired: data.session == null,
  };
}

export async function loginUser(body: { email: string; password: string }): Promise<TokenPair> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  });

  throwAuthError(error);

  const session = mapSession(data.session);
  if (session == null) {
    throw new Error("Login did not produce an active session.");
  }

  try {
    await syncAuthenticatedUser();
  } catch (syncError) {
    await supabase.auth.signOut();
    throw syncError;
  }

  return session;
}
