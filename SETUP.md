# Setup Guide – ResumeForge AI Backend

Step-by-step instructions to get the backend running locally from scratch.

---

## Prerequisites

- **Python 3.12+** – [download](https://www.python.org/downloads/)
- **PostgreSQL 15+** – local install or Supabase project
- **Supabase account** – [supabase.com](https://supabase.com) (free tier works)
- **Stripe account** – [stripe.com](https://stripe.com) (test mode)
- **OpenAI API key** – or any OpenAI-compatible provider

---

## 1. Clone the Repository

```bash
git clone <repo-url>
cd Resume.AI
```

## 2. Create a Virtual Environment

```bash
python3.12 -m venv .venv
source .venv/bin/activate   # macOS / Linux
# .venv\Scripts\activate    # Windows
```

## 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your real credentials:

| Variable | Where to find it |
|----------|-----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (use the `postgresql+asyncpg://` scheme) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `JWT_SECRET_KEY` | Generate with `openssl rand -hex 32` |
| `OPENAI_API_KEY` | OpenAI dashboard → API keys |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API keys (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe` |

## 5. Run Database Migrations

```bash
alembic upgrade head
```

To auto-generate a new migration after model changes:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

## 6. Start the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify it's running:

```bash
curl http://localhost:8000/api/v1/health
# {"status":"healthy","environment":"development","version":"0.1.0"}
```

## 7. Explore the API

Open [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive Swagger UI.

---

## Running Tests

```bash
pytest -v --cov=app --cov-report=term-missing
```

## Linting & Type Checking

```bash
ruff check .
mypy app/
```

---

## Deployment (Render)

1. Push to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set the **Build Command** to `pip install -r requirements.txt`.
4. Set the **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add all `.env` variables in the Render dashboard.
6. Deploy.

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `ModuleNotFoundError` | Activate your venv: `source .venv/bin/activate` |
| DB connection refused | Check `DATABASE_URL` uses `postgresql+asyncpg://` scheme and Supabase allows your IP |
| Alembic "Target database is not up to date" | Run `alembic upgrade head` |
| CORS errors from frontend | Add your frontend URL to `BACKEND_CORS_ORIGINS` in `.env` |
