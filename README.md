# LeadFlow - Single-Screen Lead Management CRM

LeadFlow is a clean, minimal full-stack lead management CRM designed for speed and simplicity. It allows sales and account managers to track leads, maintain chronological discussion logs, and stay ahead of follow-up commitments.

---

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, React, Tailwind CSS
- **Backend**: FastAPI, Python 3.10+, Pydantic v2
- **Database & ORM**: PostgreSQL, SQLAlchemy 2.0
- **Migrations**: Alembic
- **Testing**: pytest, HTTPX
- **Containerization**: Docker Compose (scheduled for upcoming commit)

---

## Repository Structure

```text
PravarAI-LeadFlow/
├── backend/
│   ├── alembic/
│   │   ├── versions/
│   │   │   └── 2026_10_21_0001_initial_schema.py
│   │   ├── env.py
│   │   └── script.py.mako
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_health.py
│   │   └── test_models.py
│   ├── alembic.ini
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Data Model (Commit 1)

### 1. `Lead` Entity
- `id`: Integer primary key (autoincrement)
- `name`: Required non-empty string (`varchar(255)`)
- `company`: Optional string (`varchar(255)`)
- `phone`: Optional string (`varchar(50)`)
- `status`: Required string (`varchar(50)`), defaults to `New`. Allowed values:
  - `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`
  - Validated via Pydantic enum and database check constraint `ck_leads_status`
- `next_follow_up_at`: Nullable timezone-aware datetime (`timestamptz`), indexed
- `created_at`: Timezone-aware timestamp (`timestamptz`), defaults to `now()`
- `updated_at`: Timezone-aware timestamp (`timestamptz`), updated on modification

### 2. `Discussion` Entity
- `id`: Integer primary key (autoincrement)
- `lead_id`: Foreign key to `leads.id` with `ON DELETE CASCADE`
- `note`: Required non-empty text (`text`), validated with check constraint `ck_discussions_note_non_empty`
- `created_at`: Timezone-aware timestamp (`timestamptz`), defaults to `now()`
- `follow_up_at`: Nullable timezone-aware datetime (`timestamptz`)

---

## REST API Endpoints (Commit 2)

All API endpoints are prefixed with `/api`.

| Method | Endpoint | Description | Query / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System health check | None |
| `GET` | `/api/leads` | List leads with latest discussion | `?status=Qualified&search=Acme` |
| `POST` | `/api/leads` | Create a new lead | `{"name": "...", "company": "...", "phone": "..."}` |
| `GET` | `/api/leads/{id}` | Lead detail with full discussion timeline | None |
| `PATCH` | `/api/leads/{id}/status` | Update lead status | `{"status": "Contacted"}` |
| `POST` | `/api/leads/{id}/discussions` | Add discussion note (optional follow-up) | `{"note": "...", "follow_up_at": "..."}` |

### Example Request Bodies

#### 1. Create a Lead (`POST /api/leads`)
```json
{
  "name": "Jane Doe",
  "company": "Acme Corp",
  "phone": "+1-555-0199"
}
```

#### 2. Update Lead Status (`PATCH /api/leads/{id}/status`)
Allowed statuses: `New`, `Contacted`, `Qualified`, `Proposal Sent`, `Won`, `Lost`
```json
{
  "status": "Qualified"
}
```

#### 3. Add Discussion with Scheduled Follow-up (`POST /api/leads/{id}/discussions`)
> **Note**: Providing `follow_up_at` atomically updates the lead's `next_follow_up_at`. Omitting `follow_up_at` leaves any existing scheduled follow-up unchanged. Datetimes must be timezone-aware (ISO 8601).
```json
{
  "note": "Client requested pricing proposal. Follow-up demo call arranged.",
  "follow_up_at": "2026-10-25T14:30:00Z"
}
```

---

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL (or local Docker PostgreSQL)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the root or `backend/` directory (refer to `.env.example`):
   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/leadflow
   APP_ENV=development
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Run database migrations**:
   ```bash
   alembic upgrade head
   ```

6. **Start the FastAPI development server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   - API Docs: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

7. **Run tests**:
   ```bash
   pytest -v
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Start the Next.js development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   ```
