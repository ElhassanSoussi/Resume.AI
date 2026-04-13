# Post-launch playbook — ResumeForge AI

First **24–72 hours** after public launch: funnel review, signals, and lightweight triage.

## 1. Funnel checkpoints (review in order)

Use **`ANALYTICS.md`** event names (and your webhook/dashboard if connected).

| Checkpoint | Event(s) | What “healthy” looks like |
|------------|-----------|---------------------------|
| Landing interest | `landing_cta_*_click` | Non-zero clicks proportional to visits. |
| Signup started | `signup_started` | Roughly tracks forms submitted. |
| Signup completed | `signup_completed` | `has_session: true` dominates if email confirm off; else confirm flow explained in UI. |
| Onboarding | `onboarding_completed` | Some completion; **zero** may mean dialog skipped always — OK if intentional. |
| First resume | `first_resume_created` / `resume_created` | Core activation — should be **> 0** after real traffic. |
| Preview | `preview_opened` | Users reaching “see output” stage. |
| Checkout | `checkout_started` | Intent to pay. |
| Payment | `payment_succeeded` | Webhook + return URL working. |
| PDF | `pdf_generated` | Fulfillment working. |

**Weak activation signal:** many `signup_completed` but few `resume_created` → onboarding or “new resume” path confusion.  
**Export friction:** many `checkout_started` vs few `payment_succeeded` → Stripe, return URL, or abandon rate.  
**Post-pay issues:** many `payment_succeeded` vs few `pdf_generated` → export/storage errors.

## 2. What signals mean (quick map)

| Signal | Likely meaning |
|--------|----------------|
| High traffic, **zero** signups | CTA broken, tracking off, or audience mismatch (marketing). |
| Signups, **no** resumes | Value prop unclear; wizard too long; first error on save. |
| Resumes, **no** preview | Users don’t find preview; or save errors. |
| Many **AI** errors in logs | Quota, key, or timeout — show friendly UI; scale timeout if needed. |
| Checkout **503** in logs | Config — not user error. |
| Webhook **4xx/5xx** in Stripe | Signature, URL, or cold start — fix immediately. |

## 3. Lightweight issue triage

Label every incoming issue one of:

| Tier | Definition | SLA (solo, suggest) |
|------|------------|------------------------|
| **P0 — Critical** | Data loss, security, payment taken without unlock, mass 5xx | Drop everything; fix or rollback within hours. |
| **P1 — Conversion** | Checkout flaky, webhook intermittent, save failures for subset of users | Same day or next morning. |
| **P2 — UX annoyance** | Misleading copy, small layout bug, slow non-blocking UI | Batch into weekly polish. |
| **P3 — Later** | Feature ideas, nice-to-have templates | Backlog; no launch-week work. |

**Rule:** During launch week, only **P0/P1** touch production code unless trivial one-line fix.

## 4. First 24 hours monitoring checklist

- [ ] Hour 0–1: runbook **Section B** in `LAUNCH_DAY_RUNBOOK.md`.  
- [ ] Stripe Dashboard: webhook success %; failed payments.  
- [ ] API: error rate; any repeating stack trace.  
- [ ] Read every support email; tag P0–P3.  
- [ ] End of day: note top **one** friction theme for a small copy or UX patch tomorrow.

## 5. First week iteration

- Review funnel again; compare to **staging** baseline.  
- Patch only **documented** P0/P1; ship small deploys.  
- Update `PRODUCTION_PRELAUNCH.md` / runbook if you changed URLs or env layout.

---

Related: **`STAGING_SMOKE_TESTS.md`**, **`ANALYTICS.md`**, **`RELEASE_CHECKLIST.md`**, **`BETA_VALIDATION_PACK.md`** (closed beta and scripted user tests).
