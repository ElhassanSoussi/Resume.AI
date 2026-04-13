# Deployment — ResumeForge AI

The repo is a **FastAPI** API (`app/`) and a **Next.js** app (`frontend/`). Deploy them as **two HTTPS services** (e.g. Render + Vercel). Do not serve the API over plain HTTP in production.

## Quick start

1. Provision **PostgreSQL** (Supabase, Neon, RDS, etc.).
2. Configure **Supabase Auth** for the same project the frontend uses.
3. Run **`alembic upgrade head`** against production before or as the first API boot step.
4. Set environment variables from **`PRODUCTION_ENV.md`** (backend) and **`frontend/.env.example`** (frontend).
5. Register Stripe webhook: `POST https://<api-host>/api/v1/payments/webhook`.

## Backend (Render / Fly / VM)

- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Render sets `PORT`).
- **Health:** platform check → `GET /api/v1/health`.
- **Readiness (DB):** optional stricter check → `GET /api/v1/ready` (503 if Postgres unreachable).
- **Migrations:** run Alembic in a **release phase** or one-off job **before** switching traffic to a revision that depends on new columns.
- **Logs:** set `LOG_JSON=true` if your host parses JSON logs.

On boot with `APP_ENV=production`, the API **validates** critical env vars and exits with a clear error if something is missing or still a placeholder (`app/core/startup_checks.py`).

## Frontend (Vercel / Netlify / static host + Node)

```bash
cd frontend && npm ci && npm run build
```

- **Split origin (browser → API directly):** set `NEXT_PUBLIC_API_URL=https://<api>/api/v1` and configure API **CORS** to allow your frontend origin.
- **Same origin (recommended simplicity):** leave `NEXT_PUBLIC_API_URL` unset; set `API_PROXY_TARGET` and `API_INTERNAL_BASE_URL` so Next.js rewrites `/api/v1/*` to the backend (see `frontend/next.config.ts` and `.env.example`).

## Stripe Checkout return URLs

The client builds `success_url` / `cancel_url` from the **browser origin** plus the current resume path (`resume-export-section.tsx`). Ensure users always open the app from the **canonical HTTPS URL** so Stripe returns them to the right host. Set `NEXT_PUBLIC_APP_URL` for any server-side URL needs.

## PDF / export storage

- **Single-node API + disk:** default `EXPORT_STORAGE_ROOT` works; ensure the path is on persistent disk if the platform restarts.
- **Multi-instance / serverless:** use **Supabase Storage** (`SUPABASE_EXPORTS_BUCKET` + keys) or another object store; align `PUBLIC_FILES_BASE_URL` or signed URL flow with how downloads are served.

## Related docs

| Doc | Purpose |
|-----|---------|
| `PRODUCTION_ENV.md` | Env variable matrix and health endpoints |
| `STAGING_DEPLOYMENT.md` | Staging env, deployment + migration order, risks |
| `STAGING_SMOKE_TESTS.md` | Staging E2E smoke (blockers vs nice-to-have) |
| `PRODUCTION_PRELAUNCH.md` | Pre-launch verification and top failure points |
| `LAUNCH_DAY_RUNBOOK.md` | Launch-day order of operations, 1h/24h monitoring, rollback |
| `LAUNCH_DAY_CHECKLIST.md` | Short same-day reminder (links to runbook) |
| `POST_LAUNCH_PLAYBOOK.md` | Funnel review, signals, triage after launch |
| `RELEASE_CHECKLIST.md` | Pre-deploy verification |
| `ANALYTICS.md` | Funnel event schema |
| `SETUP.md` | Local backend setup |
| `SECURITY.md` | Auth, transport, secrets |
