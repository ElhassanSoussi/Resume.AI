# ResumeForge AI – Backend

Production-ready FastAPI backend for **ResumeForge AI**, a SaaS that helps users build ATS-friendly resumes with AI, preview them in premium templates, and pay to export PDF.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115, Python 3.12 |
| ORM / Migrations | SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL via Supabase |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI-compatible provider (structured JSON output) |
| Payments | Stripe |
| Logging | structlog |
| Deployment | Render |

## Project Structure

```text
app/
├── api/v1/             # Versioned API routers
│   ├── router.py       # Aggregate v1 router
│   └── routers/        # Individual endpoint modules
├── core/               # Config, database, security, logging, deps
├── models/             # SQLAlchemy ORM models
├── schemas/            # Pydantic request/response schemas
├── services/           # Business logic layer
└── repositories/       # Data access layer
alembic/                # Database migrations
tests/                  # Pytest test suite
```

## Quick Start

```bash
# 1. Clone and enter
git clone <repo-url> && cd Resume.AI

# 2. Create virtualenv
python3.12 -m venv .venv && source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env   # then fill in real values

# 5. Run migrations
alembic upgrade head

# 6. Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs) in development mode.

## API Versioning

All endpoints are served under `/api/v1`. The health check is at `GET /api/v1/health`.

## Environment Variables

See [`.env.example`](.env.example) for local development. For production, see [`PRODUCTION_ENV.md`](PRODUCTION_ENV.md) and [`DEPLOYMENT.md`](DEPLOYMENT.md).

**Launch operations:** [`STAGING_DEPLOYMENT.md`](STAGING_DEPLOYMENT.md), [`STAGING_SMOKE_TESTS.md`](STAGING_SMOKE_TESTS.md), [`PRODUCTION_PRELAUNCH.md`](PRODUCTION_PRELAUNCH.md), [`LAUNCH_DAY_RUNBOOK.md`](LAUNCH_DAY_RUNBOOK.md), [`POST_LAUNCH_PLAYBOOK.md`](POST_LAUNCH_PLAYBOOK.md).

**Closed beta & learning:** [`BETA_VALIDATION_PACK.md`](BETA_VALIDATION_PACK.md) (readiness, user tests, funnel debug, feedback templates, triage, day 1/3/7 review). **Live beta execution:** [`BETA_LIVE_OPERATIONS.md`](BETA_LIVE_OPERATIONS.md) (issue log, debugging loop, patch/deploy, daily funnel checks, success gates).

## Testing

```bash
pytest -v --cov=app
```

## License

Proprietary – all rights reserved.
