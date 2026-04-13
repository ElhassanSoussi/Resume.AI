# Production pre-launch checklist — ResumeForge AI

Run after staging smoke passes and **before** DNS or traffic cutover to production.

## 1. Production-sensitive links and routes

| Surface | Path / endpoint | Verify |
|---------|-----------------|--------|
| Payment return | `{origin}{resumeEditPath}?payment=success` / `canceled` | User opens app from **canonical prod URL** only; Stripe Dashboard allowed return URLs if you restrict them. |
| Support | `/support` | `NEXT_PUBLIC_SUPPORT_EMAIL` set for real inbox. |
| Footer (marketing) | `/pricing`, `/examples`, `/support`, `/privacy`, `/terms`, `/login` | All 200 on **production** domain. |
| Legal | `/privacy`, `/terms` | Copy acceptable for your entity; update “Last updated” if you change legal text. |
| App shell | `/dashboard`, `/resumes/*`, `/billing`, `/settings` | Auth redirect to `/login` when logged out. |
| API health | `GET https://<api>/api/v1/health` | 200 JSON `status: healthy`. |
| API readiness | `GET https://<api>/api/v1/ready` | 200 when DB up; **503** acceptable only if DB intentionally down during maintenance. |
| Stripe webhook | `POST https://<api>/api/v1/payments/webhook` | Live endpoint registered; **live** signing secret in `STRIPE_WEBHOOK_SECRET` if charging live. |

## 2. Analytics (core funnel)

Events are defined in **`ANALYTICS.md`** and emitted via `frontend/src/lib/analytics/track.ts`. Pre-launch:

- [ ] Confirm `NEXT_PUBLIC_ANALYTICS_WEBHOOK_URL` (if used) points to a **production** receiver you control, **HTTPS** only.  
- [ ] In browser devtools (prod build preview or staging), spot-check: landing CTA → signup → first resume → preview → unlock → checkout started → payment success → PDF generated.

## 3. Placeholders and example values

- [ ] Root `.env` / host env: no `replace`, `your-project`, `sk_test_` when going **live** (unless you intentionally stay in test mode).  
- [ ] Frontend: no missing `NEXT_PUBLIC_SUPABASE_*` in production build.  
- [ ] Repo grep (optional): search deployed marketing copy for “TODO”, “lorem”, “example.com” in **your** custom pages.

## 4. Pre-launch checklist (copy/paste)

- [ ] Production DB migrated: `alembic upgrade head`.  
- [ ] `APP_ENV=production`, `DEBUG=false`, all **`PRODUCTION_ENV.md`** required vars set on API.  
- [ ] `BACKEND_CORS_ORIGINS` = **only** production frontend origin(s), HTTPS.  
- [ ] Stripe **live** (or deliberate test) keys, **live** price id for paid export, webhook **live** secret and URL.  
- [ ] Supabase production project: Auth URLs / redirect URLs allow your production app domain.  
- [ ] Frontend production env set; `npm run build` green in CI or locally.  
- [ ] `NEXT_PUBLIC_APP_URL` matches canonical app URL if used server-side.  
- [ ] PDF storage: Supabase bucket or persistent disk + download path verified once end-to-end.  
- [ ] Support email set; you can receive a test message.  
- [ ] Tag release commit / image digest recorded for rollback.

## 5. Top failure points on launch day (most likely)

1. **Stripe webhook** — wrong URL, wrong `whsec_`, or live vs test mismatch → payments stuck “pending”.  
2. **CORS** — typo in origin; trailing slash; `www` vs apex.  
3. **Checkout return URL** — user bookmarked wrong host; `success_url` lands on wrong deployment.  
4. **Supabase auth redirect** — Site URL / redirect allowlist missing production domain.  
5. **Migration not run** — new code hits missing column → 500 on core routes.  
6. **`/api/v1/ready` fails** — DB credentials, network, or pooler SSL → platform marks instance unhealthy.

---

Proceed to **`LAUNCH_DAY_RUNBOOK.md`** for ordered execution and rollback.
