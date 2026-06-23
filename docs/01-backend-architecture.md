# EveAI — Backend Architecture Document

---

## 1. Overview

EveAI's backend is an AI-first Python application built with FastAPI. Its primary job is not
serving CRUD data — it is orchestrating AI workflows that generate courses, lessons, schedules,
quizzes, and tutor responses, and persisting the results so they never need to be regenerated.

The backend is intentionally layered in a way that keeps AI logic completely separate from HTTP
handling, business logic, and database access. This separation makes each layer independently
testable and replaceable.

---

## 2. Confirmed Technology Decisions

| Concern | Choice | Reason |
|---|---|---|
| Web framework | FastAPI | Async, fast, typed |
| ORM | SQLAlchemy 2.x (async) | Industry standard |
| Migrations | Alembic | Required with SQLAlchemy |
| Validation | Pydantic v2 | Native FastAPI integration |
| Database | PostgreSQL | Source of truth |
| Vector store | Qdrant | Lesson + user context retrieval |
| AI framework | LangChain + Google Gemini | As specified |
| Background jobs | FastAPI BackgroundTasks | Replaces Celery for V1 |
| Caching / session | Redis | Chat memory, job status |
| Auth | JWT via python-jose | Email + Password only in V1 |
| Password hashing | bcrypt via passlib | Standard |

---

## 3. Architecture Layers

The backend has exactly five layers. Each layer has one responsibility and depends only on the
layer below it.

```
HTTP Request
     │
     ▼
┌─────────────────────────────┐
│         API Layer           │  FastAPI routers. Receives requests, validates input,
│     (app/api/)              │  calls service, returns response. No logic here.
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│       Service Layer         │  Business logic. Orchestrates repositories and AI
│     (app/services/)         │  services. Makes decisions. Never touches DB directly.
└─────────────────────────────┘
     │              │
     ▼              ▼
┌──────────┐  ┌─────────────────────────────┐
│Repository│  │         AI Layer            │  LangChain chains and Gemini calls.
│  Layer   │  │       (app/ai/)             │  Completely isolated. No DB access.
│(app/repos│  │                             │  Returns structured Pydantic objects.
└──────────┘  └─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│       Database Layer        │  SQLAlchemy models + Qdrant client + Redis client.
│  (app/models/, app/core/)   │  Raw data access only.
└─────────────────────────────┘
```

### Layer Rules

- API layer never imports from repositories directly.
- Service layer never writes raw SQL or Qdrant queries.
- AI layer never imports SQLAlchemy models.
- AI layer always returns structured Pydantic output, never raw strings.
- Repositories never contain business logic.

---

## 4. Request Lifecycle (Standard)

Example: User opens a lesson for the first time.

```
GET /lessons/{lesson_id}
        │
        ▼
LessonRouter (api/lessons.py)
  → validates token
  → calls lesson_service.get_lesson(lesson_id, user)
        │
        ▼
LessonService (services/lesson_service.py)
  → lesson_repo.get_lesson_content(lesson_id)
  → content exists? → return it
  → content missing?
        │
        ▼
  → fetch lesson_metadata from DB (title, order, module context)
  → fetch user_profile + hobbies from DB
  → call ai.lesson_agent.generate(metadata, user_profile)
        │
        ▼
LessonAgent (ai/agents/lesson_agent.py)
  → build LangChain prompt with metadata + user context + hobbies
  → retrieve similar content from Qdrant (optional enrichment)
  → call Gemini via LangChain chain
  → return LessonContentSchema (structured Pydantic)
        │
        ▼
  → lesson_repo.save_lesson_content(lesson_id, content)
  → vectorstore.lesson_store.upsert(lesson_id, content)
  → return content to API layer
        │
        ▼
API returns LessonResponse to frontend
```

---

## 5. Background Job Strategy

Celery is replaced with FastAPI BackgroundTasks for V1.

When onboarding completes, two background tasks are launched:

```
POST /onboarding/complete
        │
        ▼
OnboardingService
  → saves all onboarding data synchronously
  → creates job_status record: { job_id, status: "pending" }
  → triggers BackgroundTask: run_post_onboarding_setup(user_id, job_id)
  → immediately returns { job_id } to frontend
        │
        ▼ (background, non-blocking)
run_post_onboarding_setup(user_id, job_id)
  → for each subject:
      course_agent.generate_structure(subject, user_profile)
      save courses + modules + lesson_metadata to Postgres
  → schedule_agent.generate(user_profile, all_courses)
      save schedule to Postgres
  → update job_status: { status: "complete" }
```

Frontend polls `GET /jobs/{job_id}` every 5 seconds until status is `complete`, then
refreshes the dashboard.

Job status is stored in Redis with a 24-hour TTL so it survives server restarts.

---

## 6. AI Layer Design

The AI layer contains one agent per major AI workflow. Each agent is self-contained.

### 6.1 Agent Structure

Every agent follows this pattern:

```python
class SomeAgent:
    def __init__(self, llm: ChatGoogleGenerativeAI):
        self.llm = llm
        self.chain = build_chain()   # LangChain chain

    def generate(self, input: InputSchema) -> OutputSchema:
        raw = self.chain.invoke(input.dict())
        return OutputSchema.parse(raw)
```

No agent directly touches the database. Data is fetched by the service layer and passed in.

### 6.2 Agents

**CourseAgent**
- Input: subject name, academic level, major, goal, duration, weekly hours, user level
- Output: structured course with modules and lesson titles (no content)
- Chain: single prompt → JSON output parser

**LessonAgent**
- Input: lesson title, module context, subject, user academic level, hobbies
- Output: full lesson with theory, examples, hobby-based explanation, references, summary
- Chain: prompt with user context → structured JSON output
- Also: embeds lesson content into Qdrant after generation

**TutorAgent**
- Input: user question, current lesson content, user profile (level, hobbies)
- Retrieval: Qdrant similarity search on lesson_embeddings using question as query
- Output: conversational answer with optional analogy based on hobbies
- Memory: last 10 messages from Redis (per session)
- Chain: retrieval chain (Qdrant) → LangChain ConversationalRetrievalChain

**QuizAgent**
- Input: lesson content or module summary, difficulty, question count
- Output: list of quiz questions (MCQ, True/False, Subjective) with answers + explanations

**QuizEvaluationAgent**
- Input: question, expected answer, user's answer
- Output: score (0-100), feedback string
- Used only for Subjective questions; MCQ/TrueFalse are graded deterministically

**ScheduleAgent**
- Input: available time slots, subjects with priorities and weekly hours, lesson metadata list
- Output: list of schedule entries (day, start time, end time, activity type, lesson_id or quiz_id)
- Chain: structured prompt with constraints → JSON output parser

**InsightsAgent**
- Input: aggregated analytics data (progress %, quiz scores, streak, weak subjects)
- Output: 3-5 plain English insights and recommendations
- Chain: simple summary prompt → text output

### 6.3 Prompts

Each agent has its prompts stored in `ai/prompts/` as Python files returning
LangChain PromptTemplate objects. Prompts are never hardcoded inside agents.

### 6.4 Output Parsing

All agents use LangChain's `JsonOutputParser` or `PydanticOutputParser` so the output
is always a validated Pydantic schema, never a raw string. If parsing fails, the agent
raises an `AIGenerationError` which the service layer catches and handles.

---

## 7. Database Strategy

**PostgreSQL = Source of Truth**

All user data, course structures, lesson content, quiz attempts, schedules, notes, and
analytics live in PostgreSQL. If Qdrant goes down, the application still functions (tutor
quality degrades but doesn't break).

**Qdrant = Retrieval Layer**

Qdrant holds embeddings for:
- `lesson_embeddings` — chunks of lesson content, used by TutorAgent for RAG
- `user_context_embeddings` — user profile summary, used to personalize lesson generation

Qdrant is written to only after PostgreSQL is successfully written to. Never the reverse.

**Redis = Ephemeral State**

Redis holds:
- Chat session message history (key: `chat:{session_id}`, TTL: 2 hours)
- Job status for background tasks (key: `job:{job_id}`, TTL: 24 hours)

---

## 8. Authentication Flow

```
POST /auth/register
  → validate email uniqueness
  → hash password with bcrypt
  → save user to DB
  → return JWT access token

POST /auth/login
  → fetch user by email
  → verify password hash
  → return JWT access token

All protected routes:
  → Authorization: Bearer <token>
  → FastAPI dependency: get_current_user(token) → User
```

Token payload: `{ user_id, email, exp }`

Token expiry: 7 days for V1 (simple, no refresh token complexity).

---

## 9. Error Handling

All API responses follow one envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Errors:
```json
{
  "success": false,
  "data": null,
  "error": "Human-readable message"
}
```

Error types and HTTP codes:

| Situation | HTTP Code |
|---|---|
| Validation error | 422 |
| Not authenticated | 401 |
| Forbidden (not your resource) | 403 |
| Resource not found | 404 |
| AI generation failed | 500 |
| Unexpected server error | 500 |

AI generation errors are caught at service layer, logged, and returned as 500 with a
generic message. The frontend shows a retry option.

---

## 10. Lesson Generation Idempotency

This is critical. Lesson generation must never run twice for the same lesson.

The `lessons` table has a `generation_status` column:

```
pending → generating → complete → failed
```

Before generating, the service checks:
- If `complete` → return existing content immediately
- If `generating` → return 202 with "generation in progress" (another request beat us)
- If `pending` or `failed` → set to `generating`, proceed

This prevents duplicate AI calls if the user clicks the same lesson twice quickly.

---

## 11. Schedule Generation Rules

The ScheduleAgent receives available time slots (not unavailable time). It must:

- Only schedule within those slots
- Distribute subjects by priority (higher priority = more frequent slots)
- Include one break slot per 90 minutes of study
- Assign specific `lesson_id` or `quiz_id` to each study slot (not just subject)
- Never schedule a lesson before its prerequisite lesson is complete
- Respect weekly hour limits per subject

Output is stored as individual schedule rows, one per time block.

---

## 12. Onboarding Data Flow

```
Step 1: POST /onboarding/academic       → save academic_level, major to user_profiles
Step 2: POST /onboarding/subjects       → save subjects[] to subjects table
Step 3: POST /onboarding/hobbies        → save hobby links to user_hobbies
Step 4: POST /onboarding/availability   → save available_time_slots to user_profiles
Step 5: POST /onboarding/complete       → trigger background job, return job_id
```

Each step is idempotent. Re-submitting a step overwrites the previous value.
No step depends on the previous step being saved first — all are independent writes.
`/onboarding/complete` reads all previously saved data from DB to pass to AI agents.

---

## 13. Key Constraints and Non-Decisions for V1

- No file uploads (Notes are plain text only)
- No email verification (users register and are immediately active)
- No refresh tokens (7-day JWT, re-login after expiry)
- No AI subject suggestions during onboarding (manual entry only)
- No lesson regeneration (generated once, stored forever)
- No agent router (each feature calls its AI service directly)
- No rate limiting on AI endpoints (add in V2)
- No multi-tenancy or team features
