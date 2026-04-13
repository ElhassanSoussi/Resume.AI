# Product analytics — ResumeForge AI

Minimal, **privacy-conscious** funnel instrumentation. All events go through `track()` in `frontend/src/lib/analytics/track.ts`.

## Behavior

1. **Development:** events are logged with `console.debug` under `[analytics]`.
2. **Optional hook:** `window.__RF_ANALYTICS_PUSH__` — if defined as a function `(event) => void`, it receives each payload (for your own router to Segment, PostHog, etc.).
3. **Optional server sink:** set `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL` to an **https** endpoint you control. The browser sends `POST` with JSON body `{ event, properties, ts, path }` and `Content-Type: application/json`. **Do not** point at a third party without a data processing agreement; this is a simple escape hatch for a solo operator’s edge function or log drain.

No cookies are set by this layer. Do not put secrets or full resume text in `properties`.

## Event names (stable contract)

| `event` | When fired | `properties` (typical) |
|---------|------------|-------------------------|
| `landing_cta_signup_click` | Marketing hero “Start free” | `{ placement: "hero" }` |
| `landing_cta_pricing_click` | Hero “View pricing” | `{ placement: "hero" }` |
| `landing_cta_signup_footer` | CTA section primary button | `{ placement: "cta_section" }` |
| `signup_started` | Signup form submit begins | `{}` |
| `signup_completed` | Account created (session or email-confirm path) | `{ has_session: boolean }` |
| `onboarding_completed` | Workspace career prefs saved (not skipped) | `{}` |
| `first_resume_created` | First resume from wizard (once per browser) | `{ resume_id }` |
| `resume_created` | Every successful wizard create | `{ resume_id }` |
| `resume_completed` | Editor completion bar reached 100% (once per resume per session) | `{ resume_id }` |
| `ai_optimize_used` | Full resume optimize succeeds | `{ resume_id }` |
| `tailor_used` | Tailor mutation succeeds | `{ resume_id }` |
| `preview_opened` | Resume preview page mounted | `{ resume_id }` |
| `export_unlock_clicked` | User opens PDF unlock dialog | `{ resume_id }` |
| `checkout_started` | Stripe Checkout session requested | `{ resume_id }` |
| `payment_succeeded` | Stripe return + paid status confirmed | `{ resume_id }` |
| `pdf_generated` | PDF generation API succeeds | `{ resume_id, export_mode }` |
| `cover_letter_created` | Generate cover letter succeeds | `{ cover_letter_id, resume_id }` |
| `job_application_created` | Job tracker create succeeds | `{}` |

## Adding new events

1. Add a constant to `frontend/src/lib/analytics/events.ts`.
2. Call `track(...)` from **one** place (avoid duplicate fires from renders).
3. Update this table.
