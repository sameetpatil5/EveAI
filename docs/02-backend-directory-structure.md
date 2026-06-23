# EveAI — Backend Directory Structure Document

---

## Full Structure

```
backend/
│
├── app/
│   ├── main.py
│   ├── dependencies.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── onboarding.py
│   │   ├── subjects.py
│   │   ├── courses.py
│   │   ├── lessons.py
│   │   ├── quizzes.py
│   │   ├── schedule.py
│   │   ├── notes.py
│   │   ├── chat.py
│   │   ├── insights.py
│   │   ├── profile.py
│   │   └── jobs.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── onboarding_service.py
│   │   ├── subject_service.py
│   │   ├── course_service.py
│   │   ├── lesson_service.py
│   │   ├── quiz_service.py
│   │   ├── schedule_service.py
│   │   ├── note_service.py
│   │   ├── chat_service.py
│   │   ├── insights_service.py
│   │   └── profile_service.py
│   │
│   ├── repositories/
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── subject_repository.py
│   │   ├── course_repository.py
│   │   ├── lesson_repository.py
│   │   ├── quiz_repository.py
│   │   ├── schedule_repository.py
│   │   ├── note_repository.py
│   │   └── analytics_repository.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── subject.py
│   │   ├── course.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   ├── schedule.py
│   │   ├── note.py
│   │   ├── chat.py
│   │   └── analytics.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── onboarding.py
│   │   ├── subject.py
│   │   ├── course.py
│   │   ├── lesson.py
│   │   ├── quiz.py
│   │   ├── schedule.py
│   │   ├── note.py
│   │   ├── chat.py
│   │   ├── insights.py
│   │   └── common.py
│   │
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   │
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── course_agent.py
│   │   │   ├── lesson_agent.py
│   │   │   ├── tutor_agent.py
│   │   │   ├── quiz_agent.py
│   │   │   ├── quiz_evaluation_agent.py
│   │   │   ├── schedule_agent.py
│   │   │   └── insights_agent.py
│   │   │
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   ├── course_prompts.py
│   │   │   ├── lesson_prompts.py
│   │   │   ├── tutor_prompts.py
│   │   │   ├── quiz_prompts.py
│   │   │   ├── schedule_prompts.py
│   │   │   └── insights_prompts.py
│   │   │
│   │   └── schemas/
│   │       ├── __init__.py
│   │       ├── course_output.py
│   │       ├── lesson_output.py
│   │       ├── quiz_output.py
│   │       ├── schedule_output.py
│   │       └── insights_output.py
│   │
│   ├── vectorstore/
│   │   ├── __init__.py
│   │   ├── client.py
│   │   ├── lesson_store.py
│   │   └── user_context_store.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── redis.py
│   │   ├── security.py
│   │   └── exceptions.py
│   │
│   ├── background/
│   │   ├── __init__.py
│   │   └── onboarding_jobs.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── logger.py
│       └── helpers.py
│
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│
├── alembic.ini
├── requirements.txt
├── .env.example
└── README.md
```

---

## File-by-File Explanation

---

### `app/main.py`

The FastAPI application entry point.

Responsibilities:
- Creates the FastAPI app instance
- Registers all API routers with their URL prefixes
- Adds CORS middleware (allowing React frontend origin)
- Adds global exception handler that wraps all errors in the standard response envelope
- Initializes database connection on startup
- Initializes Redis connection on startup

Nothing else. No business logic here.

---

### `app/dependencies.py`

FastAPI dependency functions shared across routers.

Contains:
- `get_current_user(token)` — decodes JWT, fetches user from DB, returns User model.
  Used as `Depends(get_current_user)` in every protected route.
- `get_db()` — yields an async SQLAlchemy session
- `get_redis()` — yields the Redis client

These are injected via FastAPI's dependency injection system. No router imports
a DB session directly.

---

### `app/api/`

One file per feature domain. Each file is a FastAPI `APIRouter`.

These files do exactly three things per endpoint:
1. Receive and validate the request (Pydantic schema)
2. Call the corresponding service function
3. Return the response wrapped in the standard envelope

**`auth.py`** — `/auth/*`
Routes: register, login, get-current-user

**`onboarding.py`** — `/onboarding/*`
Routes: save academic info, save subjects, save hobbies, save availability, complete onboarding
The complete endpoint triggers a BackgroundTask and returns a job_id.

**`subjects.py`** — `/subjects/*`
Routes: list, create, update, delete, get-detail

**`courses.py`** — `/courses/*`
Routes: get course by subject, get course structure (modules + lesson metadata)

**`lessons.py`** — `/lessons/*`
Routes: get lesson (generates if missing), mark complete, get next lesson

**`quizzes.py`** — `/quiz/*`
Routes: generate quiz, submit quiz answers, get quiz history

**`schedule.py`** — `/schedule/*`
Routes: get schedule, update item status, regenerate schedule

**`notes.py`** — `/notes/*`
Routes: create, list, update, delete

**`chat.py`** — `/ai/*`
Routes: tutor chat, quick ask

**`insights.py`** — `/insights/*`
Routes: get dashboard insights, get AI report

**`profile.py`** — `/profile/*`
Routes: get profile, update profile (name, hobbies, subject settings, availability)

**`jobs.py`** — `/jobs/*`
Routes: get job status by job_id (reads from Redis)

---

### `app/services/`

Business logic layer. One file per feature domain.

Each service function:
- Accepts typed inputs (Pydantic schemas or primitives)
- Makes decisions (e.g., "does lesson content exist?")
- Calls repository functions for DB reads/writes
- Calls AI agents when generation is needed
- Returns typed Pydantic response schemas

Services never import from `app/api/`. Services never write raw SQL.

**`auth_service.py`**
- `register(email, password)` — validates uniqueness, hashes password, saves user, returns token
- `login(email, password)` — verifies credentials, returns token
- `get_user_by_id(user_id)` — used by dependency

**`onboarding_service.py`**
- `save_academic(user_id, data)` — upserts user_profile row
- `save_subjects(user_id, subjects)` — deletes existing subjects, inserts new ones
- `save_hobbies(user_id, hobby_names)` — upserts user_hobbies
- `save_availability(user_id, slots)` — updates user_profile time slots
- `complete_onboarding(user_id)` — reads all saved data, creates job_status in Redis,
  returns job_id. The actual AI work is done by `background/onboarding_jobs.py`.

**`course_service.py`**
- `get_course_by_subject(subject_id, user_id)` — returns course with generation_status
- `get_course_structure(course_id, user_id)` — returns modules + lesson metadata only (no content)

**`lesson_service.py`**
- `get_lesson(lesson_id, user_id)` — core logic: check generation_status, generate if needed,
  return content. Implements the idempotency logic described in architecture doc.
- `mark_complete(lesson_id, user_id)` — writes lesson_progress, updates subject_progress
- `get_next_lesson(course_id, user_id)` — finds next uncompleted lesson in order

**`quiz_service.py`**
- `generate_quiz(lesson_id, difficulty, user_id)` — calls QuizAgent, saves questions, returns quiz
- `submit_quiz(quiz_id, answers, user_id)` — grades MCQ/TF deterministically, calls
  QuizEvaluationAgent for subjective, saves attempt, returns result
- `get_history(user_id)` — returns past quiz attempts

**`schedule_service.py`**
- `get_schedule(user_id)` — returns weekly schedule entries
- `update_status(schedule_id, status, user_id)` — marks entry as complete/missed
- `regenerate(user_id, feedback)` — calls ScheduleAgent with current progress + feedback,
  deletes pending future entries, inserts new ones

**`chat_service.py`**
- `tutor_chat(user_id, lesson_id, message, session_id)` — loads chat history from Redis,
  calls TutorAgent, saves message + response to Redis and Postgres, returns response
- `quick_ask(user_id, subject_id, message)` — simpler flow, no lesson context, calls
  TutorAgent with reduced context

**`note_service.py`**
- `create`, `list`, `update`, `delete` — straightforward CRUD

**`insights_service.py`**
- `get_dashboard_insights(user_id)` — aggregates analytics_snapshots + live progress,
  returns structured data for dashboard stats
- `get_report(user_id)` — calls InsightsAgent with aggregated data, returns AI narrative

**`profile_service.py`**
- `get_profile(user_id)` — returns full profile with hobbies and preferences
- `update_profile(user_id, data)` — updates name, hobbies, subject details, availability

---

### `app/repositories/`

Database access layer. One file per major table group.

Each repository contains only SQLAlchemy queries — no logic, no decisions.
All functions are async and accept a db session as a parameter.

**`user_repository.py`**
- `get_by_id`, `get_by_email`, `create`, `update`
- `get_profile`, `upsert_profile`
- `get_hobbies`, `set_hobbies`

**`subject_repository.py`**
- `get_all_by_user`, `get_by_id`, `create`, `update`, `delete`
- `get_subject_progress`, `update_subject_progress`

**`course_repository.py`**
- `get_by_subject`, `get_structure` (modules + lesson metadata, no content)
- `create_course`, `create_module`, `create_lesson_metadata`
- `update_generation_status`

**`lesson_repository.py`**
- `get_metadata(lesson_id)` — title, order, module context only
- `get_content(lesson_id)` — full content (may be null)
- `save_content(lesson_id, content)` — writes content + sets status to complete
- `set_generation_status(lesson_id, status)`
- `get_progress(user_id, lesson_id)`, `mark_complete(user_id, lesson_id)`

**`quiz_repository.py`**
- `save_quiz`, `get_quiz`, `get_questions`
- `save_attempt`, `get_attempts_by_user`

**`schedule_repository.py`**
- `get_by_user`, `get_entry`, `update_status`
- `delete_pending_future_entries`, `bulk_insert`

**`note_repository.py`**
- `create`, `get_all_by_user`, `get_by_id`, `update`, `delete`

**`analytics_repository.py`**
- `get_latest_snapshot`, `save_snapshot`
- `compute_streak(user_id)` — query lesson_progress for consecutive study days
- `compute_completion_rate(user_id)` — total complete / total lessons in courses

---

### `app/models/`

SQLAlchemy ORM models. One file per domain.

These are pure table definitions — no methods, no logic.

**`user.py`**
Tables: `users`, `user_profiles`, `hobbies`, `user_hobbies`

`users`: id (UUID PK), email (unique), password_hash, created_at, updated_at
`user_profiles`: id, user_id (FK), full_name, academic_level, major,
  available_time_slots (JSONB array of {start, end}), updated_at
`hobbies`: id, name (unique)
`user_hobbies`: user_id (FK), hobby_id (FK) — composite PK

**`subject.py`**
Tables: `subjects`, `subject_progress`

`subjects`: id, user_id (FK), name, priority (1-10), level (beginner/intermediate/advanced),
  weekly_hours, target_weeks, user_goal, status (active/paused/completed), created_at
`subject_progress`: id, user_id (FK), subject_id (FK), progress_percentage (float), updated_at

**`course.py`**
Tables: `courses`, `modules`

`courses`: id, subject_id (FK), title, description, total_modules, estimated_weeks,
  generation_status (pending/generating/complete/failed), created_at
`modules`: id, course_id (FK), title, description, module_order, is_locked (bool)

**`lesson.py`**
Tables: `lessons`, `lesson_progress`

`lessons`: id, module_id (FK), title, lesson_order, content (TEXT, nullable),
  summary (TEXT, nullable), references (JSONB, nullable), youtube_links (JSONB, nullable),
  hobby_explanation (TEXT, nullable), generation_status (pending/generating/complete/failed),
  created_at
`lesson_progress`: id, user_id (FK), lesson_id (FK), completed (bool), completed_at

**`quiz.py`**
Tables: `quizzes`, `quiz_questions`, `quiz_attempts`, `quick_quiz_history`

`quizzes`: id, module_id (FK, nullable), title, passing_score (int, default 70)
`quiz_questions`: id, quiz_id (FK), question_text, question_type (mcq/truefalse/subjective),
  options (JSONB, nullable), correct_answer (TEXT), explanation (TEXT)
`quiz_attempts`: id, quiz_id (FK), user_id (FK), score (float), passed (bool),
  attempt_number, feedback (TEXT), submitted_at
`quick_quiz_history`: id, user_id (FK), subject_id (FK), difficulty, score, created_at

**`schedule.py`**
Tables: `schedules`

`schedules`: id, user_id (FK), title, start_time (TIMESTAMP), end_time (TIMESTAMP),
  activity_type (study/quiz/break/hobby), related_subject_id (FK, nullable),
  related_lesson_id (FK, nullable), related_quiz_id (FK, nullable),
  status (pending/completed/missed/overdue)

**`chat.py`**
Tables: `chat_sessions`, `chat_messages`

`chat_sessions`: id, user_id (FK), type (tutor/quickask), created_at
`chat_messages`: id, session_id (FK), role (user/assistant), message (TEXT), created_at

**`analytics.py`**
Tables: `analytics_snapshots`

`analytics_snapshots`: id, user_id (FK), streak (int), longest_streak (int),
  avg_quiz_score (float), completion_rate (float), study_hours (float), snapshot_date (DATE)

---

### `app/schemas/`

Pydantic v2 schemas for request/response validation. One file per domain.

Each file typically contains:
- `XxxCreate` — request body for creating
- `XxxUpdate` — request body for updating (all fields optional)
- `XxxResponse` — what the API returns
- `XxxListResponse` — list variant

**`common.py`**
Contains `APIResponse` — the standard envelope:
```
class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: T | None
    error: str | None
```

All API responses use `APIResponse[SomeSchema]`.

---

### `app/ai/`

The entire AI layer. Completely isolated from the rest of the application.

**`base.py`**
Creates and exports a single shared `ChatGoogleGenerativeAI` LangChain LLM instance.
All agents import from here. Reads API key from config.
Also exports a shared Google Generative AI embeddings instance used by vectorstore.

**`agents/`**

Each agent file contains one class. See Backend Architecture Document section 6.2 for
full input/output specification of each agent.

`course_agent.py` — CourseAgent
`lesson_agent.py` — LessonAgent
`tutor_agent.py` — TutorAgent (uses LangChain ConversationalRetrievalChain + Qdrant retriever)
`quiz_agent.py` — QuizAgent
`quiz_evaluation_agent.py` — QuizEvaluationAgent (used only for subjective questions)
`schedule_agent.py` — ScheduleAgent
`insights_agent.py` — InsightsAgent

**`prompts/`**

Each file exports LangChain `ChatPromptTemplate` objects. No raw strings in agents.

`course_prompts.py` — system prompt + human prompt for course structure generation
`lesson_prompts.py` — system prompt for lesson content with user context + hobbies
`tutor_prompts.py` — system prompt that establishes tutor persona + context injection
`quiz_prompts.py` — prompt for quiz question generation
`schedule_prompts.py` — heavily constrained prompt for schedule generation
`insights_prompts.py` — prompt for generating feedback narrative from analytics data

**`schemas/`**

Pydantic models that define the expected JSON output structure from each agent.
LangChain's `PydanticOutputParser` uses these to parse and validate AI responses.

`course_output.py` — `CourseStructureOutput`, `ModuleOutput`, `LessonMetadataOutput`
`lesson_output.py` — `LessonContentOutput` (title, theory, examples, hobby_explanation, references, youtube_links, summary)
`quiz_output.py` — `QuizOutput`, `QuestionOutput`, `EvaluationOutput`
`schedule_output.py` — `ScheduleOutput`, `ScheduleEntryOutput`
`insights_output.py` — `InsightsOutput` (list of insight strings + recommendation strings)

---

### `app/vectorstore/`

Qdrant interaction layer. Only the AI layer and the vectorstore module talk to Qdrant.

**`client.py`**
Creates and exports a single `QdrantClient` instance. Reads URL and API key from config.
Also defines collection names as constants: `LESSON_EMBEDDINGS`, `USER_CONTEXT_EMBEDDINGS`.

**`lesson_store.py`**
- `upsert(lesson_id, content_text, metadata)` — embeds content using Google embeddings,
  stores in Qdrant with payload: `{ lesson_id, module_id, subject_id, content_chunk }`
- `search(query_text, subject_id, top_k)` — similarity search filtered by subject,
  returns list of relevant content chunks for TutorAgent

**`user_context_store.py`**
- `upsert(user_id, profile_summary)` — embeds and stores user learning profile
- Called after onboarding completion and after profile updates

---

### `app/core/`

Infrastructure setup and shared utilities.

**`config.py`**
Pydantic `BaseSettings` class. Reads all config from environment variables.
Variables: DATABASE_URL, REDIS_URL, QDRANT_URL, QDRANT_API_KEY, GOOGLE_API_KEY,
JWT_SECRET, JWT_EXPIRE_DAYS, FRONTEND_URL

**`database.py`**
SQLAlchemy async engine setup. Exports `AsyncSessionLocal` and `Base` (declarative base).
All models import `Base` from here.

**`redis.py`**
Creates and exports a Redis client using `redis.asyncio`.
Exports helpers: `set_json(key, data, ttl)`, `get_json(key)`, `delete(key)`

**`security.py`**
JWT functions: `create_token(user_id, email)`, `decode_token(token) → payload`
Password functions: `hash_password(plain)`, `verify_password(plain, hashed)`

**`exceptions.py`**
Custom exception classes:
- `NotFoundError` — maps to 404
- `ForbiddenError` — maps to 403
- `AuthError` — maps to 401
- `AIGenerationError` — maps to 500
- `ConflictError` — maps to 409

Global handler in `main.py` catches these and returns standard error envelope.

---

### `app/background/`

FastAPI BackgroundTask functions. These are not async routes — they are regular async
functions triggered from service layer using FastAPI's `BackgroundTasks`.

**`onboarding_jobs.py`**
`run_post_onboarding_setup(user_id: str, job_id: str)`

Steps:
1. Read user_profile, subjects, hobbies from DB
2. For each subject, call CourseAgent, save to DB (courses, modules, lessons)
3. Call ScheduleAgent with all courses + user availability, save schedule to DB
4. Call user_context_store.upsert(user_id, profile_summary)
5. Update job status in Redis to "complete"
6. On any error: update job status to "failed", log error

---

### `app/utils/`

**`logger.py`**
Configured Python logger instance. All files import from here instead of using `print`.

**`helpers.py`**
Small pure utility functions (e.g., `generate_uuid()`, `utcnow()`, `chunk_text(text, size)`).
`chunk_text` is used by lesson_store to split long lesson content for Qdrant.

---

### `alembic/`

Database migration management.

`env.py` — configured to use the same DATABASE_URL as the app, imports all models
`versions/` — auto-generated migration files, one per schema change

Running `alembic upgrade head` applies all pending migrations.

---

### Root Files

**`requirements.txt`**
fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, pydantic[email],
python-jose[cryptography], passlib[bcrypt], redis[asyncio], qdrant-client,
langchain, langchain-google-genai, google-generativeai, httpx, python-dotenv

**`.env.example`**
Template showing all required environment variables with placeholder values.
Committed to repo. Actual `.env` is gitignored.
