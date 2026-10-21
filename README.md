# LeadFlow

## 1. Project Overview

**LeadFlow** is a minimal, responsive single-screen lead management CRM built as an assessment for the **PravarAI** AI-smart full-stack internship. It empowers sales representatives to track prospective deals across a 6-stage lifecycle, log timestamped interaction notes, schedule follow-up reminders, and prioritize daily activities—all within a unified, distraction-free interface.

---

## 2. Demonstration Video

Watch the complete video walkthrough demonstrating the application, Docker environment, lead management workflows, follow-up scheduling, and state persistence:

- **Loom Walkthrough**: [https://www.loom.com/share/65e436d311d84b5aa94f10df50d32ab2](https://www.loom.com/share/65e436d311d84b5aa94f10df50d32ab2)

---

## 3. Core Features

- **Single-Screen CRM Interface**: Clean, compact desktop and mobile workflow inspired by the assessment wireframes.
- **Lead Management**: Create leads with name, company, and phone. Default status begins at `New`.
- **Status Pipeline**: Six validated lifecycle stages: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, and `Lost`.
- **Discussion History**: Reverse-chronological timeline of interactions with formatted timestamps and relative time indicators.
- **Follow-up Reminders**: Schedule follow-up dates and times. Reminders scheduled for the current calendar day are grouped in a dedicated, prominent section at the top. Overdue reminders are highlighted with a red alert badge.
- **Filtering & Search**: Server-side filtering by status chips with live counts, combined with case-insensitive search by lead name.
- **Database Migrations & Seed Data**: Schema versioning with Alembic and an idempotent seed script with realistic CRM records.
- **Containerized Architecture**: Production-ready multi-container Docker Compose deployment.

---

## 4. Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 18, Tailwind CSS, Lucide React
- **Backend**: FastAPI, Python 3.12, Pydantic v2, Uvicorn
- **Database & ORM**: PostgreSQL 16, SQLAlchemy 2.0
- **Migrations**: Alembic
- **Testing**: pytest, HTTPX
- **Containerization**: Docker Compose (PostgreSQL, FastAPI backend, Next.js frontend)

---

## 5. Prerequisites

- **Docker Desktop**: Docker Compose v2+ (recommended for quick evaluation)
- **Node.js**: v18+ (tested on Node.js 20/22)
- **Python**: 3.10+ (tested on Python 3.12)
- **PostgreSQL**: 15+ (if running outside Docker)

---

## 6. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Docker Default | Local Default |
| :--- | :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL superuser password | `postgres` | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `leadflow` | `leadflow` |
| `POSTGRES_PORT` | PostgreSQL host port (Docker) | `5433` | `5432` |
| `BACKEND_PORT` | FastAPI backend host port (Docker) | `8001` | `8000` |
| `FRONTEND_PORT` | Next.js frontend host port (Docker) | `3001` | `3000` |
| `DATABASE_URL` | SQLAlchemy connection string | `postgresql+psycopg2://postgres:postgres@db:5432/leadflow` | `postgresql+psycopg2://postgres:postgres@localhost:5432/leadflow` |
| `APP_ENV` | Application environment mode | `production` | `development` |
| `CORS_ORIGINS` | Allowed CORS origins for backend API | `http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001` |
| `NEXT_PUBLIC_API_URL`| Browser-accessible backend API URL | `http://localhost:8001` | `http://localhost:8000` |

> [!NOTE]
> Docker Compose uses host ports **`3001`** (frontend), **`8001`** (backend), and **`5433`** (database) to avoid conflicts with existing host services running on default ports `3000`, `8000`, or `5432`.

---

## 7. Run with Docker Compose (Recommended)

Run the entire stack (PostgreSQL, FastAPI backend, and Next.js frontend) using Docker Compose:

### 1. Start the stack in detached mode:
```bash
docker compose up --build -d
```

### 2. Verify all containers are running and healthy:
```bash
docker compose ps
```

### 3. Seed demo CRM data:
```bash
docker compose exec backend python -m app.seed
```

### 4. Access the application:
- **Frontend Dashboard**: [http://localhost:3001](http://localhost:3001)
- **Backend API Docs (Swagger UI)**: [http://localhost:8001/docs](http://localhost:8001/docs)
- **API Health Check**: [http://localhost:8001/health](http://localhost:8001/health)

### 5. Stop the containers:
```bash
# Stop containers and preserve database volume:
docker compose down

# Or stop and completely wipe database volume:
docker compose down -v
```

---

## 8. Run Locally (Without Docker)

### Backend Setup

1. Navigate to `backend/` and initialize virtual environment:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(On macOS/Linux: `source .venv/bin/activate`)*

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   alembic upgrade head
   ```

4. *(Optional)* Seed initial CRM leads:
   ```bash
   python -m app.seed
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

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
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Seed Demo Data

The seed script creates 6 realistic fictional leads across all six statuses, multiple discussions, a follow-up scheduled for today, and an overdue follow-up. It is idempotent and safe to run multiple times without creating duplicates.

### Seed Data Composition:
- **Marcus Vance** (`Apex Logistics`) — Status: `Qualified` (Scheduled follow-up for today)
- **Elena Rostova** (`CloudScale AI`) — Status: `Contacted` (Overdue follow-up from 2 days ago)
- **Sarah Connor** (`Cyberdyne Systems`) — Status: `New` (Fresh lead with zero discussions)
- **David Kim** (`NextGen BioLabs`) — Status: `Proposal Sent` (Future scheduled follow-up)
- **Rachel Green** (`Central Perk Media`) — Status: `Won` (Contract signed note)
- **Jordan Hayes** (`BluePeak Capital`) — Status: `Lost` (Budget reallocation note)

### Execution:
- **Inside Docker**: `docker compose exec backend python -m app.seed`
- **Locally**: `python -m app.seed` (from `backend/` directory)

---

## 10. Automated Testing & Verification

### Backend Tests (pytest)
The backend test suite covers API endpoints, input validation, status transitions, follow-up atomicity, reverse-chronological ordering, and database schema constraints using an isolated in-memory SQLite database:

- **Inside Docker**:
  ```bash
  docker compose exec backend pytest -v
  ```
- **Locally**:
  ```bash
  cd backend
  pytest -v
  ```

### Frontend Type-Checking & Build
- **Type Checking**:
  ```bash
  cd frontend
  npx tsc --noEmit
  ```
- **Production Build**:
  ```bash
  cd frontend
  npm run build
  ```

---

## 11. API Endpoint Summary

All application endpoints are served under `/api` (system health is under `/health`).

| Method | Endpoint | Description | Request Body / Parameters | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint | None | `200` |
| `GET` | `/api/leads` | List leads with latest discussion and scheduled follow-up | Query params: `?status=...&search=...` | `200` |
| `POST` | `/api/leads` | Create a new lead (defaults to `New` status) | `{"name": "...", "company": "...", "phone": "..."}` | `201`, `422` |
| `GET` | `/api/leads/{id}` | Retrieve lead detail and full discussion timeline (newest first) | None | `200`, `404` |
| `PATCH` | `/api/leads/{id}/status` | Update lead status (`New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`) | `{"status": "..."}` | `200`, `404`, `422` |
| `POST` | `/api/leads/{id}/discussions` | Add discussion note; atomically updates lead `next_follow_up_at` if follow-up provided | `{"note": "...", "follow_up_at": "ISO-8601"}` | `200`, `404`, `422` |

---

## 12. Repository Structure

```text
PravarAI-LeadFlow/
├── .env.example              # Safe environment variable template
├── .gitignore                # Git ignore rules (Node, Python, environment, IDE)
├── docker-compose.yml        # Multi-container orchestration (db, backend, frontend)
├── README.md                 # Complete documentation & evaluator guide
├── backend/
│   ├── Dockerfile            # Python 3.12 slim container with health check
│   ├── alembic.ini           # Alembic database migration configuration
│   ├── requirements.txt      # FastAPI, SQLAlchemy, Alembic, psycopg2, pytest dependencies
│   ├── alembic/              # Migration versions and environment setup
│   ├── app/
│   │   ├── config.py         # Application settings via pydantic-settings
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   ├── main.py           # FastAPI application & CORS configuration
│   │   ├── models.py         # Lead & Discussion SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic v2 validation schemas
│   │   ├── seed.py           # Idempotent demo CRM data seeder
│   │   └── routers/
│   │       └── leads.py      # Lead & Discussion REST API routes
│   └── tests/
│       ├── conftest.py       # Isolated in-memory SQLite fixtures
│       ├── test_api.py       # REST API integration tests
│       ├── test_health.py    # System health tests
│       └── test_models.py    # Schema & status validation tests
└── frontend/
    ├── Dockerfile            # Next.js multi-stage build container
    ├── package.json          # Next.js 14, React 18, Tailwind CSS, Lucide React
    ├── tailwind.config.ts    # Tailwind styling tokens and breakpoints
    └── src/
        ├── app/              # Next.js App Router (page.tsx, layout.tsx, globals.css)
        ├── components/       # Single-screen CRM components
        │   ├── Header.tsx            # Navigation header & Add Lead trigger
        │   ├── StatusFilters.tsx     # 6-stage status filter chips with counters
        │   ├── TodayFollowUps.tsx    # Highlighted today's follow-up reminders
        │   ├── LeadCard.tsx          # Lead card with latest discussion & badges
        │   ├── AddLeadModal.tsx      # Add lead dialog
        │   ├── LeadTimelineModal.tsx # Discussion history & follow-up scheduler
        │   └── StatusBadge.tsx       # Distinct color-coded status badges
        ├── lib/
        │   └── api.ts        # Typed API client for FastAPI backend
        ├── types/
        │   └── crm.ts        # Shared TypeScript data models
        └── utils/
            └── date.ts       # Date formatting & relative time utilities
```
