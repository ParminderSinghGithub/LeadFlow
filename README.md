# LeadFlow

## 1. Project Overview

LeadFlow is a lightweight, single-screen lead management CRM built as a coding assessment for PravarAI's AI-smart full-stack internship. It allows sales representatives to track leads, record discussion history, update lead status, and schedule follow-up reminders.

---

## 2. Features

- **Single-Screen CRM Interface**: Clean, compact desktop and mobile workflow inspired by the assessment wireframes.
- **Lead Management**: Create leads with name, company, and phone. Default status begins at `New`.
- **Status Pipeline**: Six validated lifecycle stages: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`.
- **Discussion History**: Reverse-chronological timeline of interactions with timestamps and relative time indicators.
- **Follow-up Reminders**: Schedule follow-up dates and times. Reminders scheduled for the current calendar day are grouped in a dedicated highlighted section. Overdue reminders are highlighted in red.
- **Filtering & Search**: Server-side filtering by status chips and instant case-insensitive lead name search.
- **Database Migrations & Seed Data**: Schema versioning with Alembic and an idempotent seed script.

---

## 3. Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide React
- **Backend**: FastAPI, Python 3.12, Pydantic v2, Uvicorn
- **Database & ORM**: PostgreSQL, SQLAlchemy 2.0
- **Migrations**: Alembic
- **Testing**: pytest, HTTPX
- **Containerization**: Docker Compose (PostgreSQL, FastAPI backend, Next.js frontend)

---

## 4. Prerequisites

- **Python**: 3.10+ (tested on Python 3.12)
- **Node.js**: 18+ (tested on Node.js 22 and npm 10)
- **Database / Docker**: PostgreSQL 15+ locally or Docker Desktop with Docker Compose v2+

---

## 5. Environment Configuration

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default (Local / Docker) |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `leadflow` |
| `POSTGRES_PORT` | PostgreSQL host port (Docker) | `5433` |
| `BACKEND_PORT` | Backend host port (Docker) | `8001` |
| `FRONTEND_PORT` | Frontend host port (Docker) | `3001` |
| `DATABASE_URL` | SQLAlchemy connection string | `postgresql+psycopg2://postgres:postgres@localhost:5432/leadflow` |
| `APP_ENV` | Application environment mode | `development` |
| `CORS_ORIGINS` | Allowed CORS origins for backend API | `http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001` |
| `NEXT_PUBLIC_API_URL` | Browser-accessible backend API URL | `http://localhost:8001` (Docker) / `http://localhost:8000` (Local) |

---

## 6. Run Locally

### Backend Setup

1. Navigate to `backend/` and create a virtual environment:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(On macOS/Linux: `source .venv/bin/activate`)*

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

### Frontend Setup

1. In a separate terminal, navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 7. Run with Docker Compose

Run the entire stack (PostgreSQL, FastAPI backend, and Next.js frontend) using Docker Compose:

1. Build and start all three services in detached mode:
   ```bash
   docker compose up --build -d
   ```

2. Verify that all containers are healthy and running:
   ```bash
   docker compose ps
   ```

3. View live container logs:
   ```bash
   docker compose logs -f
   ```

4. Access the application:
   - **Frontend UI**: `http://localhost:3001`
   - **Backend API**: `http://localhost:8001`
   - **API Docs**: `http://localhost:8001/docs`

5. Stop all services and preserve data volume:
   ```bash
   docker compose down
   ```

*(To stop and remove database volumes, use `docker compose down -v`)*

---

## 8. Seed Demo Data

The seed script creates 6 realistic fictional leads across all six statuses, multiple discussions, a follow-up scheduled for today, and an overdue follow-up. It is idempotent and safe to run multiple times.

### Run Seed Locally:
```powershell
cd backend
.\.venv\Scripts\python -m app.seed
```

### Run Seed in Docker Compose:
```bash
docker compose exec backend python -m app.seed
```

---

## 9. Run Tests

Execute the backend integration test suite:

### Local:
```powershell
cd backend
.\.venv\Scripts\pytest -v
```

### Docker Compose:
```bash
docker compose exec backend pytest -v
```

---

## 10. API Endpoint Summary

All application endpoints are served under `/api` (system health is under `/health`).

| Method | Endpoint | Description | Request Body / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint | None |
| `GET` | `/api/leads` | List leads with latest discussion and scheduled follow-up | Optional query params: `?status=...&search=...` |
| `POST` | `/api/leads` | Create a new lead (defaults to `New` status) | `{"name": "...", "company": "...", "phone": "..."}` |
| `GET` | `/api/leads/{id}` | Retrieve lead detail and full discussion timeline (newest first) | None |
| `PATCH` | `/api/leads/{id}/status` | Update lead status (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`) | `{"status": "..."}` |
| `POST` | `/api/leads/{id}/discussions` | Add discussion note; atomically updates lead `next_follow_up_at` if follow-up included | `{"note": "...", "follow_up_at": "ISO-8601"}` |
