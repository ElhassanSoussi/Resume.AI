/**
 * Typed fetch wrapper pointed at the FastAPI backend.
 * Sends `Authorization: Bearer` when a token is stored (see `lib/auth/token`).
 *
 * Local dev: when `NEXT_PUBLIC_API_URL` is unset, the browser calls same-origin
 * `/api/v1/...` and Next.js rewrites proxy to FastAPI (see `next.config.ts`) — no CORS.
 */

import { getAccessToken } from "@/lib/auth/token";

/** Resolve API base (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (raw != null && raw.trim() !== "") {
    return raw.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }
  const internal = process.env.API_INTERNAL_BASE_URL?.trim();
  if (internal != null && internal !== "") {
    return internal.replace(/\/$/, "");
  }
  return "http://127.0.0.1:8000/api/v1";
}

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

/** Normalize FastAPI `detail` (string, list, or validation payload with `errors`). */
export function messageFromApiPayload(status: number, payload: unknown): string {
  if (typeof payload !== "object" || payload === null) {
    return `Request failed (${status})`;
  }
  const p = payload as Record<string, unknown>;
  const detail = p.detail;

  if (typeof detail === "string") {
    if (detail === "Validation failed." && Array.isArray(p.errors)) {
      const errs = p.errors as { field?: string; message?: string }[];
      const joined = errs
        .map((e) => {
          const f = e.field?.replace(/^body → /, "") ?? "field";
          return `${f}: ${e.message ?? "invalid"}`;
        })
        .join(" · ");
      return joined || detail;
    }
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return JSON.stringify(item);
      })
      .join("; ");
  }

  return `Request failed (${status})`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  if (!options.skipAuth) {
    const token = await getAccessToken();
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
    const msg = messageFromApiPayload(res.status, payload);
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
