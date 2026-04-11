import { apiFetch } from "@/lib/api/client";

export type UserRead = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_pro: boolean;
  avatar_url: string | null;
  created_at: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export async function registerUser(body: {
  email: string;
  password: string;
  full_name: string;
}): Promise<UserRead> {
  return apiFetch<UserRead>("/auth/register", {
    method: "POST",
    body,
    skipAuth: true,
  });
}

export async function loginUser(body: { email: string; password: string }): Promise<TokenPair> {
  return apiFetch<TokenPair>("/auth/login", {
    method: "POST",
    body,
    skipAuth: true,
  });
}
