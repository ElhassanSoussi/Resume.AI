# Launch-day runbook — ResumeForge AI

For a **solo operator**: execute in order, check boxes, pause if a **launch blocker** fails (see bottom).

## A. Exact order of operations

### Phase A — Database (before new API traffic)

1. [ ] **Backup** or confirm automated backup on production Postgres.  
2. [ ] Run **`alembic upgrade head`** against **production** (release job or one-off shell with prod `DATABASE_URL`).  
3. [ ] Confirm command exits **0**; note revision id in your log.

### Phase B — Backend

1. [ ] Deploy API container/service (same commit as tested on staging).  
2. [ ] Wait for platform “live” / health probe.  
3. [ ] **`curl -sf https://<prod-api>/api/v1/health`** → 200.  
4. [ ] **`curl -sf https://<prod-api>/api/v1/ready`** → 200.  
5. [ ] If either fails: **stop** — fix DB/connectivity before frontend cutover.

### Phase C — Stripe (if not already done)

1. [ ] Webhook endpoint = **`https://<prod-api>/api/v1/payments/webhook`**.  
2. [ ] Signing secret matches **`STRIPE_WEBHOOK_SECRET`** in prod env.  
3. [ ] Send **test webhook** from Dashboard or complete one **real** micro-transaction if you need live validation.

### Phase D — Frontend

1. [ ] Deploy frontend with **production** env (build logs clean).  
2. [ ] Open **`https://<prod-app>/`** — 200, HTTPS valid.

### Phase E — Browser smoke (15 min)

1. [ ] `/pricing`, `/privacy`, `/terms`, `/support` — 200.  
2. [ ] Sign up **or** log in with a **burner** prod account.  
3. [ ] Create minimal resume → **export** → **checkout** (use real card only if you intend live charges) → return URL → **paid** → **generate PDF** → download.  
4. [ ] Optional: cover letter + job row (5 min).

## B. First 1 hour — what to watch

| Signal | Where | Action if bad |
|--------|--------|-----------------|
| API process restarts / crash loop | Host metrics | Logs for `RuntimeError` (config) or import errors. |
| **5xx rate** on `/api/v1/*` | Logs / APM | Identify route; rollback API if widespread. |
| **Stripe webhook failures** | Stripe Dashboard → Webhooks | Fix secret/URL; replay events after fix. |
| **Checkout 503** | User report + API logs | Stripe env / price id. |
| **`payment.intent_failed` / `stripe.request_failed`** | API logs | Auth to Stripe or rate limit. |
| **`app.unhandled_exception`** | API logs + Sentry if enabled | Triage top stack; hotfix or rollback. |

## C. First 24 hours — what to watch

- Stripe: **failed payments**, dispute/chargeback notifications.  
- API logs: sustained **5xx**, slow **export** or **AI** timeouts.  
- Support inbox (if public): export unlock, “charged but locked”, PDF quality.  
- Optional analytics sink: drop-off between **`checkout_started`** and **`payment_succeeded`**.

## D. Logs / events that matter most

| Log / event | Meaning |
|-------------|---------|
| `app.startup` | API booted past config validation. |
| `app.unhandled_exception` | Bug — prioritize. |
| `stripe.request_failed` | Stripe integration / key / network. |
| `payment.checkout_completed` | Webhook path credited a session. |
| `payment.intent_failed` | User card or Stripe decline. |
| `payment.webhook_unknown_session` | Session id mismatch — investigate duplicate envs or wrong Stripe account. |
| `health.database_check_failed` | `/ready` will 503 — DB down or credentials wrong. |

## E. When to stop launch and roll back

**Stop sending traffic / pause marketing** and **revert API** (or full stack) if:

- `/api/v1/ready` **503** for more than a few minutes after deploy.  
- **Widespread 5xx** on auth, resume save, or checkout (not a single user error).  
- **Webhooks** cannot be delivered after two fix attempts (wrong URL/secret).  
- **Data corruption** or wrong DB targeted.

**Rollback:** redeploy **previous** API image/tag; keep DB migrations only if backward-compatible — if a migration is destructive, coordinate with restore from backup (avoid re-running bad migration).

## F. What counts as a launch blocker

| Blocker | Example |
|---------|---------|
| Cannot **sign up** or **log in** | Supabase or API auth broken. |
| Cannot **save** resume | Core product unusable. |
| **Checkout** never starts or always 503 | No revenue path. |
| **Paid** state never achieved after successful payment | Trust / legal risk — webhook must work. |
| **PDF** always fails after paid | Product promise broken. |

Non-blockers for same-day: minor UI glitches, nice-to-have analytics gaps, single slow AI request.

---

**Short companion:** `LAUNCH_DAY_CHECKLIST.md` — ultra-short reminder list.  
**After day 1:** `POST_LAUNCH_PLAYBOOK.md`.
