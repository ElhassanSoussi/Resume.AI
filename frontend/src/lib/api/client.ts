/**
 * Typed fetch wrapper pointed at the FastAPI backend.
 * Sends `Authorization: Bearer` when a token is stored (see `lib/auth/token`).
 */

import { getAccessToken } from "@/lib/auth/token";

const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Skip JSON serialization (FormData, etc.) */
  rawBody?: BodyInit;
  /** Skip attaching Authorization header */
  skipAuth?: boolean;
};

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${DEFAULT_BASE.replace(/\/$/, "")}${path}`;
  const headers = new Headers(options.headers);

  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let body: BodyInit | undefined = options.rawBody;
  if (options.body !== undefined && !options.rawBody) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  const payload = await parseJsonSafe(res);

  if (!res.ok) {
    const msg =
      typeof payload === "object" &&
        payload !== null &&
        "detail" in payload &&
        typeof (payload as { detail: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "PATCH", body }),
  delete: <T>(path: string, init?: RequestOptions) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
};
