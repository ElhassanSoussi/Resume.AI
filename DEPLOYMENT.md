# Deployment — ResumeForge AI

This repository contains a **FastAPI** backend (`/app`) and a **Next.js** frontend (`/frontend`). Deploy them as separate services with HTTPS everywhere.

## Environment summary

### Backend (e.g. Render, Fly.io, AWS)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Async PostgreSQL (e.g. Supabase) |
| `JWT_SECRET` / auth secrets | As required by `app/core/config.py` |
| `OPENAI_API_KEY` | AI rewrite / optimize |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments |
| `STRIPE_PRICE_ID_SINGLE_EXPORT` | One-time PDF product |
| `PUBLIC_FILES_BASE_URL` | Optional public base for PDF download URLs |
| CORS | Allow your frontend origin |

### Frontend (e.g. Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL for `/api/v1` (e.g. `https://api.example.com/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | Optional; used when building absolute URLs server-side |

Local dev defaults: API `http://localhost:8000/api/v1`, app `http://localhost:3000`.

## Stripe

1. Create a **Price** for the one-time PDF product; set `STRIPE_PRICE_ID_SINGLE_EXPORT` on the API.
2. Register webhook endpoint: `POST https://<api-host>/api/v1/payments/webhook` with signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Use Stripe **Checkout** success/cancel URLs that match your frontend routes (see resume editor export flow).

## Database

Run Alembic migrations against the production database before or as part of deploy:

```bash
alembic upgrade head
```

## Frontend build

```bash
cd frontend && npm ci && npm run build && npm start
```

## Health checks

Point load balancer health checks to `GET /api/v1/health` (or your configured health route).

## PDF storage

Default storage is local filesystem under the API host; for multi-instance or serverless, swap `LocalFilesystemStorage` for S3-compatible storage and set `PUBLIC_FILES_BASE_URL` accordingly.
