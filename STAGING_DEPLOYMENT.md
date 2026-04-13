# Staging deployment — ResumeForge AI

Staging should mirror **production behavior** (especially API startup validation). Use a **separate** Supabase project, Postgres database, and Stripe **test** mode from live.

## 1. Deployment assumptions (current codebase)

| Layer | Typical host | Notes |
|-------|----------------|------|
| **Frontend** | Vercel preview / staging project, or Render static + Node | Next.js  `frontend/`; needs env at **build** and **runtime** for server. |
| **Backend** | Render / Fly / VM | FastAPI `app/`; `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. |
| **Database** | Supabase Postgres, Neon, etc. | URL must use `postgresql+asyncpg://` (see root `.env.example`). |
| **Stripe** | Test mode keys + test Price + webhook to **staging API** URL | Checkout return URLs are built from the **browser origin** on the resume export page. |
| **AI** | OpenAI or compatible endpoint | Same key shape as prod; use a capped key or separate project if cost is a concern. |
| **Legal / support** | Same Next routes as prod | `/privacy`, `/terms`, `/support` — set `NEXT_PUBLIC_SUPPORT_EMAIL` if you want a visible address. |

## 2. Staging environment variables (complete naming)

### Backend (staging API)

Use **`APP_ENV=production`** and **`DEBUG=false`** on staging so **`startup_checks`** matches production (`app/core/startup_checks.py`). Use **staging-only** secrets (not production DB or live Stripe).

| Variable | Staging value |
|----------|----------------|
| `APP_ENV` | `production` |
| `DEBUG` | `false` |
| `DATABASE_URL` | Staging DB only; **not** localhost in hosted staging |
| `JWT_SECRET_KEY` | Unique secret ≥ 32 chars (not shared with prod) |
| `SUPABASE_*` | Staging Supabase project |
| `OPENAI_API_KEY` | Your test/dev key |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `STRIPE_PRICE_ID_SINGLE_EXPORT` | Test **Price** id |
| `STRIPE_WEBHOOK_SECRET` | From Stripe CLI or Dashboard webhook pointing at **staging** `…/api/v1/payments/webhook` |
| `BACKEND_CORS_ORIGINS` | JSON list including **`https://<your-staging-app>`** exactly (scheme + host, no typo) |
| `LOG_JSON` | `true` recommended |
| `AUTO_CREATE_SCHEMA` | Prefer `false`; rely on Alembic |

Optional: `SENTRY_DSN` for a staging Sentry project (optional).

### Frontend (staging app)

| Variable | Staging value |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` / key | Same **staging** Supabase as API |
| `NEXT_PUBLIC_API_URL` **or** proxy trio | Same pattern as prod: either browser → `https://staging-api…/api/v1` **or** same-origin + `API_PROXY_TARGET` + `API_INTERNAL_BASE_URL` |
| `NEXT_PUBLIC_APP_URL` | `https://staging-app…` (canonical staging URL) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional test inbox |
| `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL` | Optional; point at a **staging** receiver, not prod |

## 3. Startup validation in staging

With `APP_ENV=production`, the API **exits on boot** if required vars are missing or look like placeholders (`replace`, `…`). Before first deploy:

1. Fill **every** variable in `PRODUCTION_ENV.md` “Required” table with **real staging** values.
2. Run the API locally once: `APP_ENV=production DEBUG=false … uvicorn app.main:app` and confirm it starts without `RuntimeError: Invalid production configuration`.

## 4. Migration order and deployment order

### Migration order

- Migrations are **linear** under `alembic/versions/`. Always run **`alembic upgrade head`** against the target DB once per environment.
- **Never** deploy code that **requires** a new column before the migration has succeeded on that database.
- If you have multiple heads, resolve with `alembic merge` before staging/prod.

### Deployment order (staging)

1. **Database** exists and is reachable from the API host.  
2. **`alembic upgrade head`** against staging DB (CI job or manual).  
3. **Backend** deploy with env vars; wait for **green** platform health (e.g. `GET /api/v1/health`).  
4. **`GET /api/v1/ready`** returns 200 (DB connectivity).  
5. **Stripe webhook** (test mode) targets staging API URL; send a test event or complete a test checkout.  
6. **Frontend** deploy with staging env; **build** must succeed (`npm run build`).  
7. **Browser smoke** (see `STAGING_SMOKE_TESTS.md`).

## 5. Staging deployment checklist (copy/paste)

- [ ] Staging Postgres created; `DATABASE_URL` uses `+asyncpg` and TLS if required.  
- [ ] Staging Supabase project; anon + service role in API; anon (or publishable) in frontend.  
- [ ] `JWT_SECRET_KEY` unique to staging.  
- [ ] `APP_ENV=production`, `DEBUG=false` on API.  
- [ ] `OPENAI_API_KEY` set.  
- [ ] Stripe **test** secret, test **price** id, webhook **signing secret** for staging API URL.  
- [ ] `BACKEND_CORS_ORIGINS` includes exact staging frontend origin (`https://…`).  
- [ ] `alembic upgrade head` on staging DB completed successfully.  
- [ ] API deployed; `/api/v1/health` and `/api/v1/ready` return 200.  
- [ ] Frontend deployed; opens over HTTPS.  
- [ ] Legal routes load: `/privacy`, `/terms`, `/support`.  
- [ ] One full **signup → resume → checkout (test card)** path completed (see smoke doc).

## 6. Known staging risks

| Risk | Mitigation |
|------|------------|
| **CORS mismatch** | Origin must match scheme + host + no trailing slash mismatch vs `BACKEND_CORS_ORIGINS`. |
| **Webhook delivered to wrong URL** | Separate Stripe webhook endpoints for staging vs prod; different `whsec_`. |
| **Checkout return URL wrong host** | Open staging app only from its **canonical** URL; avoid bare IP or mixed `www` / non-`www`. |
| **`.env` copied from prod** | Never use prod DB or `sk_live_` on staging. |
| **`APP_ENV=development` on hosted API** | Skips production startup checks — you lose early misconfiguration detection. Prefer `production` + staging resources. |
| **Migration drift** | Run migrations before deploying code that depends on them. |

---

Next: **`STAGING_SMOKE_TESTS.md`** (E2E smoke), then **`PRODUCTION_PRELAUNCH.md`**, **`LAUNCH_DAY_RUNBOOK.md`**, **`POST_LAUNCH_PLAYBOOK.md`**.
