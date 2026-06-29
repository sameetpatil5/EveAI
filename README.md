# EveAI

EveAI is an AI-powered personalized learning platform that combines a FastAPI backend with a React + Vite frontend to deliver adaptive lessons, quizzes, study schedules, notes, and tutor-style guidance.

## What EveAI does

- Guides users through onboarding and profile setup
- Generates structured courses, lessons, and quizzes with AI
- Supports study planning, notes, and progress tracking
- Offers a conversational learning experience through the app interface

## Tech stack

### Backend

- FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- Redis
- Qdrant
- Google Gemini / LangChain

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Query
- Zustand

## Repository structure

- backend/ — API server, database models, AI workflows, and background jobs
- frontend/ — React application and UI experience
- docs/ — architecture and implementation notes

## Prerequisites

Before running the project locally, make sure you have:

- Python 3.11+
- Node.js 20+
- PostgreSQL running locally
- Redis running locally
- Qdrant running locally (or a reachable instance)
- A Google Gemini API key

## Quick start

### 1. Backend setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create a `.env` file in the backend folder with the environment variables required by the app, including database, Redis, Qdrant, and Gemini settings.

Then start the backend:

```bash
python run.py
```

The API will be available at:

- <http://localhost:8000>
- API docs: <http://localhost:8000/docs>

### 2. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env.local` file with the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at:

- <http://localhost:5173>

## Development notes

- Backend changes typically go under the `backend/app` package.
- Frontend changes typically go under `frontend/src`.
- Architecture and implementation notes are available in the `docs/` folder.

## License

This project is intended for internal and collaborative development use.
