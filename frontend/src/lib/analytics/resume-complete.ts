const prefix = "rf_analytics_resume_completed_";

export function shouldFireResumeCompletedEvent(resumeId: string): boolean {
  if (typeof window === "undefined") return false;
  const key = `${prefix}${resumeId}`;
  try {
    if (window.sessionStorage.getItem(key)) return false;
    window.sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return false;
  }
}
