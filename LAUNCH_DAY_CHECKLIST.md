# Launch day checklist — ResumeForge AI

Short list for the day you point DNS at production. **Full order of operations, monitoring, and rollback** → **`LAUNCH_DAY_RUNBOOK.md`**.

## Pre-flight (same day, morning)

1. Confirm **production** Stripe mode vs **test** mode matches what you intend to charge.
2. Open `/pricing`, `/privacy`, `/terms`, `/support` on the **production** URL — no 404s.
3. `curl -sf https://<api>/api/v1/health` and `curl -sf https://<api>/api/v1/ready` return 200.

## First real user path (30 minutes)

1. Incognito: sign up → dashboard → onboarding dialog (skip or complete).
2. Create resume (wizard) → edit → preview.
3. Optional: tailor, cover letter, job row.
4. Export: unlock → pay (small real charge or test mode per your choice) → confirm **paid** in app → generate PDF.

## Post-deploy monitoring (48 hours)

- Stripe Dashboard: failed payments, webhook delivery errors.
- API logs: spikes in `app.unhandled_exception`, `stripe.request_failed`, `payment.intent_failed`.
- Support channel (email): respond to export / refund questions per your published policy.

## If something critical breaks

1. **Payments / webhooks:** disable new checkouts in product UI (feature flag or maintenance message) *or* revert API to last good deploy; fix webhook URL / signing secret mismatch first.
2. **Database:** stop writes if corruption suspected; restore from snapshot; do **not** re-run destructive migrations blindly.
3. **Auth:** verify Supabase JWT settings and frontend `NEXT_PUBLIC_SUPABASE_*` match the project users hit.

## After stabilizing

- Tag the release in git.
- Note any env var or Stripe Dashboard change in your internal log for the next deploy.
