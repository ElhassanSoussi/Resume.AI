# Release checklist — ResumeForge AI

Run **before** every production deploy (solo builder–friendly).

## Config & secrets

- [ ] `APP_ENV=production`, `DEBUG=false` on the API.
- [ ] `DATABASE_URL` points at the production database (not localhost).
- [ ] `JWT_SECRET_KEY` is unique to production and ≥ 32 characters.
- [ ] Supabase URL + anon + **service role** keys match the production project.
- [ ] `OPENAI_API_KEY` (and `OPENAI_BASE_URL` if not OpenAI) set for production.
- [ ] Stripe **live** (or dedicated test) `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_SINGLE_EXPORT`, `STRIPE_WEBHOOK_SECRET`.
- [ ] Stripe Dashboard webhook URL: `https://<api-host>/api/v1/payments/webhook` — **verified** delivery in test mode first.
- [ ] `BACKEND_CORS_ORIGINS` lists only your real frontend HTTPS origins.

## Frontend

- [ ] `NEXT_PUBLIC_SUPABASE_*` matches the same Supabase project as the API.
- [ ] API wiring: either `NEXT_PUBLIC_API_URL=https://…/api/v1` **or** same-origin proxy via `API_PROXY_TARGET` + `API_INTERNAL_BASE_URL` documented in `frontend/.env.example`.
- [ ] `NEXT_PUBLIC_APP_URL` set to the canonical app URL if you rely on server-side absolute links.
- [ ] Optional: `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL`, `SENTRY_DSN` (+ `sentry-sdk` on API).

## Database

- [ ] `alembic upgrade head` against production (or migration job completed successfully).
- [ ] Prefer `AUTO_CREATE_SCHEMA=false` when migrations are the source of truth.

## Smoke (staging or production test mode)

- [ ] `GET /api/v1/health` → 200.
- [ ] `GET /api/v1/ready` → 200 (database reachable).
- [ ] Sign up / log in; create resume; open preview; AI optimize (or graceful error if quota empty).
- [ ] Export: open unlock → Stripe Checkout (test card) → return URL → paid → generate PDF → download if URLs are public or signed correctly.

## Legal & product surfaces

- [ ] Marketing footer links resolve: Privacy, Terms, Support (`/privacy`, `/terms`, `/support`).
- [ ] Pricing copy matches what Stripe Checkout displays.

## Rollback

- [ ] Previous API container/image tag or Render **Manual Deploy** target noted.
- [ ] If checkout or webhooks break after deploy: pause traffic or revert API first, then fix Stripe endpoints.

See also: `PRODUCTION_PRELAUNCH.md`, `LAUNCH_DAY_RUNBOOK.md`, `LAUNCH_DAY_CHECKLIST.md`, `POST_LAUNCH_PLAYBOOK.md`, `DEPLOYMENT.md`, `PRODUCTION_ENV.md`, `ANALYTICS.md`.
