# Launch checklist — ResumeForge AI

Use this before pointing a production domain at the stack.

## Configuration

- [ ] Production `DATABASE_URL` and migrations applied (`alembic upgrade head`).
- [ ] `JWT_SECRET` (or equivalent) set and unique per environment.
- [ ] `NEXT_PUBLIC_API_URL` matches deployed API `/api/v1` base.
- [ ] CORS allows the production frontend origin only.
- [ ] Stripe **live** keys, **live** price ID, webhook URL registered and verified.
- [ ] `PUBLIC_FILES_BASE_URL` (or equivalent) set if PDFs must be publicly downloadable.
- [ ] `OPENAI_API_KEY` (or provider) set for AI features; test quota.

## Smoke tests

- [ ] Sign up / sign in; token stored as `resumeforge_access_token` in localStorage.
- [ ] Create resume (wizard) → edit → autosave.
- [ ] AI: rewrite summary / experience / full optimize (expect graceful error if AI down).
- [ ] Preview: all three templates render.
- [ ] Billing page loads payments and export history (empty OK).
- [ ] Export: checkout (test card in Stripe test mode) → return URL → payment status **paid** → generate PDF → download link works if storage URL is public.
- [ ] Delete resume from dashboard.

## Observability

- [ ] API logs structured and retained (e.g. Render logs, CloudWatch).
- [ ] Error tracking for frontend (optional: Sentry).
- [ ] Uptime check on `/api/v1/health`.

## Legal / product

- [ ] Privacy policy and terms linked from marketing site.
- [ ] Cookie/consent if required in your jurisdiction.

## Final

- [ ] DNS for app + API points to correct targets; TLS certificates valid.
- [ ] Rollback plan documented (previous deployment tag / image).

---

**Post-launch:** monitor Stripe dashboard for failed payments, API 5xx rate, and export failures for the first 48 hours.
