# Live beta operations — real-time execution, debugging, iteration

Use during **active beta** alongside `BETA_VALIDATION_PACK.md`, `ANALYTICS.md`, `STAGING_SMOKE_TESTS.md`, and `LAUNCH_DAY_RUNBOOK.md`. For a **solo developer**: keep logs tight, ship small patches, re-verify core flows after each deploy.

---

## 1. Live beta issue handling system

### 1.1 How issues are captured

| Channel | Use for |
|---------|---------|
| **Bug reports** | Repro steps, screenshots, “expected vs actual” — always one row in the issue log. |
| **Confusion points** | User completed flow but hesitated / wrong mental model — log as `confusing_ux` unless it caused a hard failure. |
| **Failed flows** | Blocked task (save, checkout, PDF) — severity ≥ P1 until disproven. |
| **Payment / export** | Always **P0 candidate** until confirmed not money-affecting — capture Stripe session id / time if user has it. |
| **Analytics** | Drop-off spike or zero events where you expect activity — log as `source: analytics` with date range + event names. |

Ask users to use **Settings → Beta feedback** (mailto / form) so subject lines stay searchable.

### 1.2 Minimal issue log (one row per issue)

Copy into a **Markdown file** (`beta-issues.md`), **Notion database**, or spreadsheet — same fields everywhere:

| Field | Required | Example |
|-------|----------|---------|
| **id** | Yes | `B-014` |
| **title** | Yes | `Checkout returns success but resume stays locked` |
| **type** | Yes | `bug` \| `confusing_ux` \| `payment_export` \| `failed_flow` |
| **steps** | Yes for bugs | Numbered steps from cold start |
| **expected** | Yes | `After pay, export shows unlocked within 2 min` |
| **actual** | Yes | `Stuck on pending 20+ min` |
| **severity** | Yes | `P0` \| `P1` \| `P2` \| `P3` |
| **source** | Yes | `user:email` \| `analytics` \| `self` |
| **env** | If relevant | `staging` / `prod`, browser, approximate time UTC |
| **status** | Yes | `open` \| `investigating` \| `fix_deployed` \| `wontfix` \| `duplicate` |
| **notes** | Optional | Links to PR, Stripe event id, log line |

**Notion-style equivalent:** one table with these columns; **Markdown:** use a heading per issue `### B-014 — title` then bullet list of fields.

**Goal:** Every issue is **one line of title + repro** someone can act on in 5 minutes; nothing lives only in DMs.

---

## 2. Rapid debugging workflow (solo)

### 2.1 Loop (repeat until fixed)

1. **Reproduce** — same browser / account class as reporter; if you can’t, ask for **exact URL + time + account type** (incognito vs logged in).  
2. **Classify layer** — frontend (UI, network tab) / backend (API status + body) / Stripe (Dashboard → Payments + Webhooks) / AI (503, timeout, bad JSON) / DB (`/api/v1/ready`, migrations).  
3. **Isolate** — smallest action that triggers bug (one API call, one click).  
4. **Fix** — smallest diff; avoid drive-by refactors.  
5. **Test locally** — run the **same** path; run `pytest` / `tsc` as usual for touched code.  
6. **Deploy patch** — follow §3.  
7. **Verify** — confirm with reporter or re-run **critical** smoke row (`STAGING_SMOKE_TESTS.md` subset) on deployed env.

### 2.2 Common failures → first checks

| Symptom | Layer | First checks |
|---------|--------|----------------|
| Checkout failure / 503 on create session | Backend + Stripe | API logs; `STRIPE_*` env; price id; Stripe status page. |
| Return from Stripe but still locked | Stripe + backend | Webhook delivery + signature; `payment.webhook_unknown_session` in logs. |
| PDF export failure after paid | Backend + storage | Export service logs; Supabase bucket / disk path; auth on download URL. |
| AI generation error | Backend + provider | Quota, model name, timeout; user-facing message vs raw 500. |
| Missing data after refresh | Frontend + API | Cache vs refetch; wrong `resume_id`; 401 token. |
| Navigation / blank page | Frontend | Route, RSC error overlay, `middleware`, chunk load failure. |

---

## 3. Patch + deploy loop (safe but fast)

### 3.1 Minimal workflow

```text
fix/beta-014-short-desc  →  local fix  →  pytest / tsc  →  commit  →  merge to deploy branch  →  deploy API and/or FE  →  verify
```

- **One issue per branch** when possible; keeps rollback obvious.  
- Tag or note **deployed commit hash** in the issue row when you ship.

### 3.2 Urgency class

| Class | When | Flow |
|-------|------|------|
| **Urgent hotfix** | P0: money wrong, mass 5xx, auth broken | Fix → minimal test → deploy **as soon as green** → watch logs 30–60 min. |
| **Normal fix** | P1 / clear P2 with repro | Same day or next; full local smoke of touched area. |
| **Backlog** | P3, one-off opinion, nice-to-have | Log only; batch weekly. |

### 3.3 Pre-redeploy checklist (every patch)

- [ ] No **new** linter/type errors introduced.  
- [ ] **Core beta flow** still passes locally: signup path OR login, open one resume, save, **or** run unit tests touching changed code.  
- [ ] **Env vars unchanged** on host (no accidental secret rotation).  
- [ ] If DB migration: ran **only** forward migration on correct DB first; never deploy code **requiring** new columns before migration.  
- [ ] After deploy: **`/api/v1/health`** (and **`/ready`** if API) + **one** user-path click test.

---

## 4. Real-time funnel monitoring (daily)

Check **`ANALYTICS.md`** event names (and your webhook sink if enabled). **Daily** — same time each day, 10 minutes.

| Transition | Healthy enough | Concerning | Likely meaning | Immediate action |
|------------|----------------|------------|----------------|-------------------|
| Signup started → completed | Most starts complete | <50% complete | Supabase / email confirm / errors | Reproduce signup; check Supabase auth logs; read API errors. |
| Onboarding completed vs skipped | Either pattern stable | Sudden 100% skip + complaints | Dialog broken / scary | Read onboarding copy; reproduce on mobile. |
| Signup completed → first resume | Some resumes within 24h | Near zero | Activation failure | Dashboard empty state; wizard step 1; first save error. |
| Preview opened vs resumes | Reasonable ratio | Almost no previews | Discoverability | Check links from editor / coach; analytics wiring. |
| Checkout started → payment succeeded | Most checkouts pay | Big gap | Stripe / webhook / return URL | Stripe Dashboard webhooks + API logs for `payment.*`. |
| Payment succeeded → PDF generated | Most paid generate | Gap after pay | Export / storage | Export logs; try one paid test yourself. |

**If analytics is off:** fall back to **issue log count** by `payment_export` tag — even 2 similar rows = investigate.

---

## 5. User feedback interpretation

| Signal | How to read it |
|--------|----------------|
| **Single complaint** | Log as P2/P3 unless safety or money — **do not** redesign for one voice. |
| **Repeated issue** | Same **area + symptom** from **2+ unrelated users** OR same bug **3+** times — treat as **P1** candidate. |
| **Confusion vs bug** | If repro is “they expected X but product does Y” and Y is **by design** → **copy / onboarding** fix, not logic (unless Y is wrong). |
| **Preference vs blocker** | “I wish it were purple” → ignore or backlog; “I can’t pay” → P0/P1. |

### Examples

| Input | Action |
|-------|--------|
| One user wants a new template | **Ignore** for beta backlog (P3). |
| Two users can’t find Preview | **Fix now** (P1): nav or CTA copy / placement. |
| One user says “AI feels weird” with no repro | **Fix later**: ask for before/after text; tag `weak_ai_output`. |
| Paid, no unlock, **two** reports | **Fix now** (P0/P1): webhooks / session lookup. |

**Rule:** Never ship a **large** feature mid-beta; only **fixes and small copy/UX** that unblock activation, export, or payment.

---

## 6. Beta iteration strategy (weekly cycle)

**Focus:** activation success → export success → payment success.

**Avoid:** new product categories, visual redesigns, broad refactors.

### Weekly cycle (suggested: same weekday each week)

1. **Collect** — merge DMs + issue log + analytics notes into one list.  
2. **Categorize** — tag every row (§1.2); dedupe.  
3. **Fix top P0/P1** — max **2–3** issues per week for solo sustainability.  
4. **Redeploy** — §3.  
5. **Re-test** — critical smoke rows + any fixed path.  
6. **Communicate** — one line to beta group: “We fixed X and Y; please retry Z.”

---

## 7. Beta success criteria (“ready to launch publicly”)

Treat as **gates**, not perfection:

| Criterion | Pass bar (adjust to your risk tolerance) |
|-----------|------------------------------------------|
| **Users complete full flow** | Majority of invited users who intend to finish reach **preview + export decision** (pay or deliberate skip) without you hand-holding. |
| **Payment works reliably** | No open **P0** payment issues; Stripe webhooks **>99%** success over a week **or** explained failures. |
| **Export works reliably** | **payment → pdf_generated** drop not worse than your staging baseline; no pattern of failed downloads. |
| **Low confusion rate** | **Confusing_ux** issues trend **down** week-over-week **or** stay only P3 after copy fixes. |
| **Manageable bug volume** | You can clear **P0/P1** within days; backlog not growing faster than you ship. |

**Public launch** = these gates + your **`PRODUCTION_PRELAUNCH.md`** + **`LAUNCH_DAY_RUNBOOK.md`** checklist.

---

## 8. Output summary (this document)

| # | Deliverable | Section |
|---|-------------|---------|
| 1 | Live beta issue handling + capture + log structure + tracking format | §1 |
| 2 | Issue tracking template (fields) | §1.2 |
| 3 | Debugging workflow + failure map | §2 |
| 4 | Patch / deploy loop + hotfix vs normal + pre-redeploy checklist | §3 |
| 5 | Funnel monitoring checklist + actions | §4 |
| 6 | Feedback interpretation rules | §5 |
| 7 | Weekly iteration + success criteria | §6–7 |

**Stop:** This pass is **documentation only** — no new major features or platform redesign.
