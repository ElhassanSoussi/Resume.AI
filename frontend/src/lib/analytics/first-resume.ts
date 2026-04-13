const FIRST_RESUME_KEY = "rf_analytics_first_resume_recorded";

/** Returns true the first time in this browser we record a first-resume milestone. */
export function consumeFirstResumeAnalyticsSlot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(FIRST_RESUME_KEY)) return false;
    window.localStorage.setItem(FIRST_RESUME_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
