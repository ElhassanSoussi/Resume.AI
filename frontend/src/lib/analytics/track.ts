export { ANALYTICS_EVENTS } from "./events";

export type AnalyticsPayload = {
  event: string;
  properties?: Record<string, unknown>;
  ts: number;
  path: string;
};

/**
 * Provider-agnostic product analytics: dev console, optional `window.__RF_ANALYTICS_PUSH__`,
 * and optional `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL` (HTTPS POST JSON).
 */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const ts = Date.now();
  const path = window.location.pathname;
  const payload: AnalyticsPayload = { event, properties: properties ?? {}, ts, path };

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", payload.event, payload.properties);
  }

  type WindowWithHook = Window & { __RF_ANALYTICS_PUSH__?: (p: AnalyticsPayload) => void };
  const hook = (window as WindowWithHook).__RF_ANALYTICS_PUSH__;
  if (typeof hook === "function") {
    try {
      hook(payload);
    } catch {
      /* ignore consumer hook failures */
    }
  }

  const url = process.env.NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL?.trim();
  if (url?.startsWith("https://")) {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => { });
  }
}
