# Production environment — ResumeForge AI

Single reference for **required** and **optional** variables when `APP_ENV=production` on the API. The backend **refuses to start** if production validation fails (see `app/core/startup_checks.py`).

## Backend (FastAPI — e.g. Render)

| Variable | Required | Notes |
|----------|----------|--------|
| `APP_ENV` | Yes | Must be `production` for strict checks. |
| `DEBUG` | Yes | Must be `false` / `0` / `off`. |
| `DATABASE_URL` | Yes | `postgresql+asyncpg://…` — not localhost. |
| `JWT_SECRET_KEY` | Yes | Strong secret (≥ 32 chars), not a placeholder. |
| `SUPABASE_URL` | Yes | Real project URL (not `.env.example` text). |
| `SUPABASE_ANON_KEY` | Yes | Public anon key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role (server only). |
| `OPENAI_API_KEY` | Yes | Or compatible provider key the app is configured to use. |
| `OPENAI_BASE_URL` | Optional | Defaults to OpenAI; set for Azure OpenAI / compatible proxies. |
| `STRIPE_SECRET_KEY` | Yes | `sk_live_…` or `sk_test_…` — real key, no `replace` / `...` fragments. |
| `STRIPE_PRICE_ID_SINGLE_EXPORT` | Yes | Stripe Price id for one-time PDF unlock. |
| `STRIPE_WEBHOOK_SECRET` | Yes | Signing secret for `POST …/api/v1/payments/webhook`. |
| `BACKEND_CORS_ORIGINS` | Yes | JSON array or comma list of **https** frontend origins (localhost http allowed for dev). |
| `API_V1_PREFIX` | Optional | Default `/api/v1`. |
| `EXPORT_STORAGE_ROOT` | Optional | Filesystem export root when not using Supabase Storage. |
| `SUPABASE_EXPORTS_BUCKET` | Optional | Bucket name when using Supabase for PDFs. |
| `PUBLIC_FILES_BASE_URL` | Optional | If absolute public URLs are required for downloads. |
| `LOG_LEVEL` | Optional | Default `INFO`. |
| `LOG_JSON` | Optional | Set `true` on platforms where JSON logs are easier to query. |
| `AUTO_CREATE_SCHEMA` | Optional | Prefer `false` in production when using **only** Alembic migrations. |
| `SENTRY_DSN` | Optional | If set **and** `sentry-sdk` is installed, unhandled errors are also sent to Sentry. |

## Frontend (Next.js — e.g. Vercel)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same project as backend. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Or alias keys documented in `frontend/.env.example`. |
| `NEXT_PUBLIC_API_URL` | Deploy-dependent | Set to `https://<api-host>/api/v1` when the browser calls the API cross-origin. Omit for **same-origin** `/api/v1` (Next rewrite to backend). |
| `API_PROXY_TARGET` | Same-origin setup | Backend origin **without** `/api/v1` (Next server rewrites). |
| `API_INTERNAL_BASE_URL` | Often in prod | Server-side fetches to API (`https://…/api/v1`). |
| `NEXT_PUBLIC_APP_URL` | Recommended | `https://<app-host>` — helps server-side absolute URLs; Stripe return URLs use browser `origin` when opened in the client. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional | Shown on the Support page. |
| `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL` | Optional | If set, `track()` POSTs JSON `{ event, properties, ts }` (see `ANALYTICS.md`). |

## Health checks

- **Liveness / cheap:** `GET /api/v1/health` — process up; no database probe.
- **Readiness:** `GET /api/v1/ready` — returns **503** if the database cannot be reached.

Point platform health checks at `/api/v1/health`; use `/api/v1/ready` for pre-promotion or stricter orchestration.
