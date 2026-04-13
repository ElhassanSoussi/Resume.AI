# Staging E2E smoke tests — ResumeForge AI

Run in **incognito** (or a clean browser profile) against your **staging HTTPS URL**. Use Stripe **test** cards. Solo-friendly: about **30–45 minutes** for critical path; add nice-to-haves when time allows.

## Critical launch blockers (must pass)

Do these in order where dependencies exist (e.g. resume before tailor / export).

| # | Step | Action | Expected outcome |
|---|------|--------|-------------------|
| 1 | **Landing** | Open `/` | Page loads; hero and CTAs visible; no console errors blocking render. |
| 2 | **Pricing** | Open `/pricing` | Pricing and FAQ render; links work. |
| 3 | **Legal** | Open `/privacy`, `/terms`, `/support` | All 200; support shows email if `NEXT_PUBLIC_SUPPORT_EMAIL` set. |
| 4 | **Signup** | `/signup` — create account | Redirect to dashboard **or** email-confirm message; no stuck spinner. |
| 5 | **Onboarding** | Complete or skip workspace dialog | Dashboard usable; no broken layout. |
| 6 | **Dashboard** | `/dashboard` | Lists load or sensible empty state; navigation works. |
| 7 | **New resume** | `/resumes/new` — complete wizard | Redirect to resume **edit** URL; resume appears on dashboard. |
| 8 | **Resume editing** | Edit page — change a field, wait for autosave | No persistent save error toast; refresh shows data (or note if cache-only). |
| 9 | **AI optimize** | Open AI panel — run full optimize | Success or clear **503/402** message; no silent failure. |
| 10 | **Tailoring** | `/resumes/{id}/tailor` — paste JD, tailor | New version saved; success toast. |
| 11 | **Preview** | `/resumes/{id}/preview` | Preview renders; template/mode controls respond. |
| 12 | **Export unlock** | Edit page — export section — **Unlock PDF** | Dialog opens; **Continue to checkout** redirects to **Stripe** (test). |
| 13 | **Stripe checkout** | Pay with test card `4242…` | Success redirect to resume URL with `?payment=success`. |
| 14 | **Payment return** | After redirect | UI shows **paid** / unlock state within ~1–2 minutes (webhook); not stuck “pending” forever. |
| 15 | **PDF generation** | Generate ATS or Designed PDF | Success toast; download or link works per your storage config. |
| 16 | **Cover letter** | `/cover-letters/new` — generate from resume + JD | Letter saved; opens detail page. |
| 17 | **Job tracker** | `/jobs` — add one application | Row appears; refresh still shows it. |

**If any critical row fails:** fix or document before production cutover (especially **4, 12–15**).

## Nice-to-have checks (when time allows)

| Step | Action | Expected |
|------|--------|----------|
| Examples | `/examples` | Content loads. |
| Billing | `/billing` | Page loads (empty state OK). |
| Settings | `/settings` | Saves preferences without error. |
| Versions | `/resumes/{id}/versions` | Tailored version visible after tailor step. |
| Logout / login | Sign out, sign back in | Session restores access to resumes. |
| Mobile width | Repeat critical steps on narrow viewport | Usable (no horizontal trap on key flows). |
| Analytics | DevTools → optional webhook or `console.debug [analytics]` | Events fire on signup, checkout, PDF (see `ANALYTICS.md`). |

## Quick failure triage

| Symptom | Likely cause |
|---------|----------------|
| API won’t start | `APP_ENV=production` + failed `startup_checks` — read stderr. |
| CORS error in browser | `BACKEND_CORS_ORIGINS` missing exact frontend origin. |
| Checkout 503 | Stripe env or price id placeholder / wrong mode. |
| Paid never unlocks | Webhook URL or `STRIPE_WEBHOOK_SECRET` mismatch; check Stripe Dashboard delivery logs. |
| PDF fails after paid | Storage bucket, disk path, or `PUBLIC_FILES_BASE_URL` / signed URL config. |
| Auth errors | Supabase URL/keys mismatch between frontend and project. |
