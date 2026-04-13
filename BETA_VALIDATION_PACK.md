# Closed beta & early-user validation — ResumeForge AI

Single pack for **beta readiness**, **5–10 user tests**, **funnel debugging**, **feedback + triage**, and **day 1 / 3 / 7** review. Pair with `ANALYTICS.md`, `POST_LAUNCH_PLAYBOOK.md`, `STAGING_SMOKE_TESTS.md`, and **`BETA_LIVE_OPERATIONS.md`** (real-time issue handling, debugging, patch loop, daily funnel monitoring).

---

## 1. What this pack fixes (learning gaps before)

- No shared definition of **beta-safe** vs **defer** scope for a solo founder.
- No **scripted** tester tasks and **neutral** interview prompts tied to activation and payment.
- Funnel events existed without a **qualitative** “healthy vs concerning” interpretation.
- No **lightweight** feedback/bug templates or **repeat-signal** rule.
- In-app path to feedback was easy to miss — **Settings → Beta feedback** plus optional form URL.

---

## 2. Closed beta readiness

### 2.1 What must be especially stable

| Area | Why |
|------|-----|
| Signup + session | Without accounts, you learn nothing else. |
| Resume create + save | Core artifact; broken saves destroy trust. |
| Preview | Users validate “does this look like me” before paying. |
| Export unlock → Checkout → return → **paid** | Money + trust. |
| PDF generation after paid | Fulfillment promise. |
| AI optimize + tailor | Differentiated value; failures should be **clear**, not silent. |

### 2.2 Minimum beta-safe flows (must work end-to-end)

1. Landing → signup (or login)  
2. Onboarding dialog (complete or skip — both OK if stable)  
3. New resume (wizard) → edit autosave  
4. AI improve (full optimize **or** summary rewrite — at least one path)  
5. Tailor (save version)  
6. Preview  
7. Export unlock → Stripe checkout (test or small real, your choice) → payment success in UI  
8. PDF generate + download (or signed URL) as you configured in staging/prod  

### 2.3 OK to be imperfect during beta

- Billing history polish, deep settings (non-career), edge template combinations, job tracker extras, cover letter polish beyond “generate + save”, marketing copy A/B, performance micro-optimizations, empty-state illustration quality.

### 2.4 Beta-only guardrails (solo-realistic)

- **Invite-only** access (password on Vercel preview, allowlist emails in Supabase, or private URL).  
- **Stripe test mode** until you explicitly want paid beta.  
- Short **in-product line** on export: you already state Stripe + review preview — keep factual.  
- **Do not** promise response SLAs you cannot keep; say “we read all feedback” in Settings card.

### 2.5 Beta launch checklist (copy/paste)

- [ ] Staging smoke from `STAGING_SMOKE_TESTS.md` passed for critical rows.  
- [ ] 5–10 testers identified; calendar slots or async window agreed.  
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` and/or `NEXT_PUBLIC_BETA_FEEDBACK_URL` set.  
- [ ] Analytics webhook or console verified for core events (`ANALYTICS.md`).  
- [ ] You have a **single** place (Notion/Airtable/Sheet) for raw notes + tags.  
- [ ] You know your **P0** definition (see §7).  

---

## 3. Real user test plan (5–10 users)

### 3.1 Best first testers

| Segment | Why include |
|---------|-------------|
| **Students / recent grads** | Thin experience sections; stress wizard + AI. |
| **Entry-level job seekers** | Volume apply; care about speed and clarity. |
| **Non-native English speakers** | Surfaces AI tone, idiom, and clarity issues. |
| **Career changers** | Tailor + “story” coherence; version history matters. |

Mix **at least three** of these in a 5–10 pool; avoid only power users who already love résumé tools.

### 3.2 Tasks (what they do)

**Session length ~45–60 min** (or async: send script, due in 48h).

1. Sign up; complete or skip onboarding — note which.  
2. Create **one** resume from scratch **or** paste-heavy (you assign per person to vary).  
3. Run **one** AI improvement (optimize or rewrite).  
4. Tailor to a **real** job posting they care about (or you provide a sample JD).  
5. Open preview; switch template or mode **once** if they find it.  
6. Go to export: read unlock copy; **if** you use paid beta, complete checkout; else stop before pay and describe willingness.  
7. If paid: generate PDF and download.  
8. Optional: start a cover letter **or** add one job — timeboxed to 10 min.

### 3.3 What you observe (silent notes)

- Hesitation points (where they pause >20s without reading).  
- Mis-clicks, back button, refresh, duplicate tabs.  
- Exact wording of errors (screenshot).  
- Whether they **read** export / AI disclaimers.  
- Whether they **trust** paywall enough to continue.

### 3.4 Post-test questions (neutral)

Ask **after** the task, in this order (past before future):

1. “Walk me through what you did from memory — what was the first thing that felt unclear?”  
2. “Where did you feel fastest vs slowest?”  
3. “At export / payment, what were you expecting vs what happened?”  
4. “If this were yours for a month, what’s the **one** thing you’d fix first?”  

**Avoid:** “Wasn’t that easy?” / “Do you love feature X?” — leading.  
**Avoid:** defending the product in the room; say “thank you, noted” and move on.

### 3.5 Debiasing

- Same script for everyone; don’t demo the product first beyond “please explore.”  
- Don’t fix bugs **during** the session unless they’re blocked — note and fix after.  
- Pay small gift card **after** feedback if you promised it — not contingent on praise.

---

## 4. Tester task script (send verbatim)

**Subject:** ResumeForge closed beta — 45-minute test (no prep required)

Hi — thanks for testing ResumeForge. We’re validating real job-search flows, not judging you.

**Please:**

1. Open the link we sent, create an account (or log in).  
2. Build **one** résumé you’d actually send (or a realistic practice one).  
3. Use **AI** at least once to improve wording.  
4. Use **Tailor** with a real job description (paste the posting).  
5. Open **Preview** and check how it reads.  
6. Open **Export** — if you’re comfortable, complete checkout **only** if we told you to use a test card / small amount; otherwise stop at the paywall and tell us what you’d need to feel confident paying.  
7. If you paid: **generate the PDF** and confirm you can open the file.

**Afterward:** reply to this email (or use the feedback form link) with:  

- **2 minutes:** what felt clearest vs most confusing  
- **1 screenshot** if anything broke  
- Optional: your rough career stage (student / early / career change / other)

We read everything. Thank you.

---

## 5. Funnel debugging framework

Events: see **`ANALYTICS.md`**. Qualitative interpretation:

| Step | Healthy enough | Concerning | Likely cause → fix direction |
|------|----------------|------------|------------------------------|
| Landing CTA clicks | Some clicks vs visits | Near-zero clicks | CTA buried, wrong audience, tracking off → check hero/pricing, analytics pipe |
| Signup started | Tracks submits | Zero with traffic | Form error, Supabase config → logs, network |
| Signup completed | Reasonable vs started | Large drop | Email confirm surprise, weak errors → copy, error messages |
| Onboarding completed | Some completes or skips | N/A unless 100% abandon + confusion in interviews | Dialog copy, skip path |
| First resume created | Majority of completed signups within session or 24h | Very few | Wizard length, first error, “where do I start?” → dashboard CTA, wizard step 1 |
| Preview opened | Fraction of resumes | Almost none | Discoverability of preview link → nav, coach copy |
| Checkout started | Some attempts among “ready” users | Zero with many previews | Price shock, trust, unlock UX → copy, readiness hints |
| Payment succeeded | Most checkouts | Drop here | Webhook, return URL, Stripe mode → ops runbook |
| PDF generated | Most paid | Drop after pay | Storage, API errors → logs, export service |
| Cover letter / job | Optional usage | Zero forever | Not a beta blocker unless you promised it |

**Repeated signal rule:** same theme from **≥2 unrelated testers** or **≥3 analytics sessions** with same drop → prioritize. One-off opinion → log as P3 unless safety.

---

## 6. Feedback collection

### 6.1 Simple feedback template (user-facing)

```text
1. What were you trying to do? (one sentence)
2. What happened instead? (facts only — what you clicked / saw)
3. Urgency: [ ] blocking  [ ] annoying  [ ] idea
4. Browser + device (e.g. Safari iOS, Chrome Mac)
5. Optional screenshot
```

### 6.2 Bug report template

```text
Title: [Area] short description (e.g. Export — checkout stuck)

Steps:
1.
2.
3.

Expected:
Actual:
Screenshot / error text:
When (date/time, timezone):
```

### 6.3 Post-test interview (15 min voice)

Use §3.4 questions; add: “Anything we didn’t ask that we should know?” Close with “What would make you recommend this to a friend — honestly?”

### 6.4 Categories (tag every item)

| Tag | Use when |
|-----|----------|
| `bug` | Repro steps, broken behavior |
| `confusing_ux` | Worked but wrong mental model |
| `missing_trust` | Payment, data, AI honesty |
| `weak_ai_output` | Tone, accuracy vs stated facts, hallucination worry |
| `payment_export` | Checkout, webhook, PDF, download |
| `low_value` | “Don’t get why I’d pay / return” |

### 6.5 One-off vs repeated

- **Repeated:** same tag + same **area** (e.g. export) from 2+ users → schedule fix.  
- **One-off:** log once; revisit if analytics agrees later.

---

## 7. Issue triage + decision framework

| Tier | Meaning | Examples |
|------|---------|----------|
| **P0** | Broken / unsafe / money wrong | Can’t sign in; paid not unlocking; data loss |
| **P1** | Conversion / activation blocked | Save fails intermittently; checkout always 503; no one finds preview |
| **P2** | Trust / quality | AI feels dishonest; scary legal gap; misleading price |
| **P3** | Polish / ideas | New template, nice animation |

**Conflicting asks:** default to **activation + export + payment** first; defer “different feature directions” to a backlog column “post-beta.” **Rule:** no new major product categories during beta; only fixes and **small** learning-oriented UX.

---

## 8. Small product improvements (beta learning) — implemented vs optional

### Implemented

- **Settings → Beta feedback** card: optional `NEXT_PUBLIC_BETA_FEEDBACK_URL`, prefilled **mailto** when `NEXT_PUBLIC_SUPPORT_EMAIL` is set, link to **Support** (`frontend/src/components/settings/beta-feedback-card.tsx`, `frontend/src/lib/beta-feedback.ts`).

### Optional next (same spirit, not required)

- One-line **toast** after PDF success: “Problems? Settings → Beta feedback.”  
- **Slightly stronger** API error strings for AI/export (copy-only PRs).

---

## 9. Beta operations — day 1 / 3 / 7 funnel review

| When | Check |
|------|--------|
| **Day 1** | All P0s triaged; Stripe webhooks OK; signup → first resume rate eyeball vs invites sent |
| **Day 3** | Funnel table filled from analytics; top **one** drop-off assigned an owner |
| **Day 7** | Decide keep / kill / postpone features; ship **one** P1 if data supports it |

### Top metrics to watch first (solo-friendly)

1. Invites sent vs **accounts created**  
2. **First resume created** (or `resume_created`) per cohort  
3. **`checkout_started` → `payment_succeeded`** (if paid beta)  
4. **`payment_succeeded` → `pdf_generated`**  
5. Raw feedback count by **tag** (§6.4)

---

## 10. How you’re ready for real-user validation

You have: **stable scope definition**, **repeatable test script**, **funnel interpretation**, **templates + triage**, **in-app feedback entry**, and a **calendar** for post-beta decisions — without expanding product surface area.

**Stop condition for this pass:** documentation + minimal Settings feedback path delivered; no new major categories.
