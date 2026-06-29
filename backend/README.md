# EveAI Backend

The backend for EveAI is a FastAPI service that powers onboarding, course generation, lessons, quizzes, scheduling, notes, and AI-assisted tutoring.

## Overview

This service is responsible for:

- Authenticating users and managing access
- Storing and retrieving learning-related data
- Orchestrating AI workflows for lesson and course generation
- Managing background jobs for onboarding and content creation
- Exposing REST APIs for the frontend experience

## Core technologies

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Redis
- Qdrant
- Google Gemini and LangChain

## Project structure

- app/api/ — API routes and request handling
- app/services/ — business logic and orchestration
- app/repositories/ — database access and persistence logic
- app/models/ — SQLAlchemy models
- app/schemas/ — request and response validation models
- app/ai/ — AI agents, prompts, and schemas
- app/core/ — configuration, security, and shared infrastructure

## Getting started

### 1. Create a virtual environment

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in this folder with the required values for:

- database connection strings
- Redis URL
- Qdrant URL and API key if needed
- Gemini API keys and model names
- JWT secret and algorithm settings

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. Start the backend

```bash
python run.py
```

The API will be available at:

- http://localhost:8000
- API docs: http://localhost:8000/docs

## Development notes

- The AI layer is organized around agents and prompts under the app/ai directory.
- Background jobs are used for onboarding and content generation flows.
- The API layer is intentionally thin and delegates most logic to services.
