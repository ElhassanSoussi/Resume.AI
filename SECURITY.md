# Security — ResumeForge AI

## Authentication

- **API**: JWT bearer tokens issued after login; all protected routes validate the token (see `app/core/deps.py`).
- **Frontend**: Stores the session token in `localStorage` under `resumeforge_access_token`. This is appropriate for SPA + API patterns; for stricter models use httpOnly cookies and SameSite policies (requires backend session changes).

## Transport

- Serve **only HTTPS** in production for both app and API.
- Set strict **CORS** to known frontend origins.

## Secrets

- Never commit `.env`, API keys, or Stripe secrets.
- Rotate `JWT_SECRET`, Stripe keys, and database credentials on a schedule or after any leak.

## Payments

- **Stripe Checkout** handles card data; your servers receive tokens and webhooks, not raw PANs.
- Verify **webhook signatures** (`stripe-signature` header) — implemented on `POST /api/v1/payments/webhook`.

## AI

- AI endpoints use **server-side** API keys only (`OPENAI_API_KEY` or compatible).
- Prompts are constrained to structured JSON outputs; still review for PII in logs.

## Exports

- PDF generation runs **server-side**; files are scoped by `user_id` and `resume_id`.
- Download URLs must not expose other users’ objects; enforce authorization in export services (see `ExportService` / guards).

## Dependency updates

- Run `pip audit` / `npm audit` regularly and patch critical CVEs.

## Reporting

- For security issues, disclose privately to the project maintainers; do not open public issues with exploit details until patched.
