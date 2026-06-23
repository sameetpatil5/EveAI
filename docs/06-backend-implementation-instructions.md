# EveAI — Backend Implementation Instructions
**Version:** 1.0
**For:** AI Coding Agent (Claude Code / Copilot)
**Source of Truth:** Architecture documents 01 and 02, API specification document 05

---

## HOW TO USE THIS DOCUMENT

- Follow phases in exact order. Do not skip ahead.
- Each step has: **What to create**, **What it must contain**, **Done condition**.
- After every phase, run the listed verification checks before proceeding.
- Never introduce libraries, patterns, or files not specified here.
- If a step says "stub", implement the function signature + `pass` or a placeholder return — do not write full logic yet.

---

## PHASE 1 — Project Scaffold

### Step 1.1 — Create directory structure

Create the following empty directory tree. Do not create any files yet.

```
backend/
├── app/
│   ├── api/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── schemas/
│   ├── ai/
│   │   ├── agents/
│   │   ├── prompts/
│   │   └── schemas/
│   ├── vectorstore/
│   ├── core/
│   ├── background/
│   └── utils/
├── alembic/
│   └── versions/
```

**Done condition:** All directories exist. No files yet.

---

### Step 1.2 — Create `requirements.txt`

Create `backend/requirements.txt` with exactly these packages:

```
fastapi
uvicorn[standard]
sqlalchemy[asyncio]
asyncpg
alembic
pydantic[email]
pydantic-settings
python-jose[cryptography]
passlib[bcrypt]
redis[asyncio]
qdrant-client
langchain
langchain-google-genai
google-generativeai
httpx
python-dotenv
```

**Done condition:** File exists with all packages listed.

---

### Step 1.3 — Create `.env.example`

Create `backend/.env.example`:

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/eveai
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
GOOGLE_API_KEY=your_google_api_key_here
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
```

**Done condition:** File exists with all variables and placeholder values.

---

### Step 1.4 — Create `__init__.py` files

Create empty `__init__.py` in every directory inside `app/`:
- `app/__init__.py`
- `app/api/__init__.py`
- `app/services/__init__.py`
- `app/repositories/__init__.py`
- `app/models/__init__.py`
- `app/schemas/__init__.py`
- `app/ai/__init__.py`
- `app/ai/agents/__init__.py`
- `app/ai/prompts/__init__.py`
- `app/ai/schemas/__init__.py`
- `app/vectorstore/__init__.py`
- `app/core/__init__.py`
- `app/background/__init__.py`
- `app/utils/__init__.py`

**Done condition:** All `__init__.py` files exist and are empty.

---

## PHASE 2 — Core Infrastructure

### Step 2.1 — Create `app/core/config.py`

Create a Pydantic `BaseSettings` class named `Settings` that reads these variables from environment:

```python
DATABASE_URL: str
REDIS_URL: str
QDRANT_URL: str
QDRANT_API_KEY: str = ""
GOOGLE_API_KEY: str
JWT_SECRET: str
JWT_EXPIRE_DAYS: int = 7
FRONTEND_URL: str
```

Export a single instance: `settings = Settings()`

All other files import from this instance. Never call `os.environ` directly anywhere else.

**Done condition:** `from app.core.config import settings` works. `settings.JWT_SECRET` returns the env value.

---

### Step 2.2 — Create `app/core/exceptions.py`

Define these exception classes (all inherit from `Exception`):

```python
class NotFoundError(Exception): pass
class ForbiddenError(Exception): pass
class AuthError(Exception): pass
class AIGenerationError(Exception): pass
class ConflictError(Exception): pass
class ValidationError(Exception): pass
```

No logic. Just class definitions.

**Done condition:** All six classes exist and are importable.

---

### Step 2.3 — Create `app/utils/logger.py`

Create a configured Python logger:

```python
import logging

logger = logging.getLogger("eveai")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s — %(name)s — %(levelname)s — %(message)s"))
logger.addHandler(handler)
```

Export `logger`. All other files import from here — never use `print()`.

**Done condition:** `from app.utils.logger import logger; logger.info("test")` prints a formatted log line.

---

### Step 2.4 — Create `app/utils/helpers.py`

Implement these three pure utility functions:

```python
import uuid
from datetime import datetime, timezone

def generate_uuid() -> str:
    """Returns a new UUID4 string."""
    return str(uuid.uuid4())

def utcnow() -> datetime:
    """Returns current UTC datetime."""
    return datetime.now(timezone.utc)

def chunk_text(text: str, size: int = 500) -> list[str]:
    """Splits text into chunks of approximately `size` characters, splitting on whitespace."""
    words = text.split()
    chunks, current = [], []
    length = 0
    for word in words:
        if length + len(word) > size and current:
            chunks.append(" ".join(current))
            current, length = [], 0
        current.append(word)
        length += len(word) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks
```

**Done condition:** All three functions are importable and work correctly when called manually.

---

### Step 2.5 — Create `app/core/security.py`

Implement JWT and password functions using `python-jose` and `passlib`:

```python
# Functions to implement:

def create_token(user_id: str, email: str) -> str:
    """Creates a JWT with payload {user_id, email, exp}. Uses settings.JWT_SECRET.
    Expiry: settings.JWT_EXPIRE_DAYS days from now."""

def decode_token(token: str) -> dict:
    """Decodes and validates JWT. Returns payload dict.
    Raises AuthError if invalid or expired."""

def hash_password(plain: str) -> str:
    """Hashes a plain password using bcrypt."""

def verify_password(plain: str, hashed: str) -> bool:
    """Returns True if plain matches hashed."""
```

Use `jose.jwt` for token operations and `passlib.context.CryptContext(schemes=["bcrypt"])` for password hashing.

**Done condition:** `create_token` returns a string. `decode_token(create_token(id, email))` returns the payload. `verify_password("test", hash_password("test"))` returns True.

---

### Step 2.6 — Create `app/core/database.py`

Set up SQLAlchemy async engine:

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass
```

Export: `engine`, `AsyncSessionLocal`, `Base`.

**Done condition:** File is importable. `Base` is a valid SQLAlchemy declarative base.

---

### Step 2.7 — Create `app/core/redis.py`

Set up Redis client with helper functions:

```python
import redis.asyncio as aioredis
import json
from app.core.config import settings

redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

async def set_json(key: str, data: dict, ttl: int) -> None:
    """Serializes data to JSON and stores in Redis with TTL in seconds."""

async def get_json(key: str) -> dict | None:
    """Retrieves and deserializes JSON from Redis. Returns None if key missing."""

async def delete(key: str) -> None:
    """Deletes a key from Redis."""
```

Export: `redis_client`, `set_json`, `get_json`, `delete`.

**Done condition:** File is importable. Functions have correct signatures.

---

## PHASE 3 — Database Models

Create all SQLAlchemy models. Each model file imports `Base` from `app.core.database`. Use UUID strings for all primary keys (stored as `String` type). Use `String` type for UUID columns (not native UUID type) for maximum compatibility.

---

### Step 3.1 — Create `app/models/user.py`

Define four tables:

**`users`**
- `id`: String PK, default=`generate_uuid()`
- `email`: String, unique=True, nullable=False
- `password_hash`: String, nullable=False
- `onboarding_complete`: Boolean, default=False
- `created_at`: DateTime, default=`utcnow()`
- `updated_at`: DateTime, default=`utcnow()`, onupdate=`utcnow()`

**`user_profiles`**
- `id`: String PK
- `user_id`: String FK → `users.id`, unique=True
- `full_name`: String, nullable=True
- `academic_level`: String, nullable=True
- `major`: String, nullable=True
- `available_time_slots`: JSON, nullable=True (list of `{start, end}` dicts)
- `updated_at`: DateTime

**`hobbies`**
- `id`: String PK
- `name`: String, unique=True

**`user_hobbies`**
- `user_id`: String FK → `users.id`
- `hobby_id`: String FK → `hobbies.id`
- Composite PK: `(user_id, hobby_id)`

**Done condition:** All four SQLAlchemy model classes are defined and importable.

---

### Step 3.2 — Create `app/models/subject.py`

**`subjects`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `name`: String
- `priority`: Integer (1-10)
- `level`: String (beginner/intermediate/advanced)
- `weekly_hours`: Float
- `target_weeks`: Integer
- `user_goal`: String, nullable=True
- `status`: String, default="active"
- `created_at`: DateTime

**`subject_progress`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `subject_id`: String FK → `subjects.id`, unique=True
- `progress_percentage`: Float, default=0.0
- `updated_at`: DateTime

**Done condition:** Both model classes defined and importable.

---

### Step 3.3 — Create `app/models/course.py`

**`courses`**
- `id`: String PK
- `subject_id`: String FK → `subjects.id`
- `title`: String
- `description`: String, nullable=True
- `total_modules`: Integer, default=0
- `estimated_weeks`: Integer, nullable=True
- `generation_status`: String, default="pending"
- `created_at`: DateTime

**`modules`**
- `id`: String PK
- `course_id`: String FK → `courses.id`
- `title`: String
- `description`: String, nullable=True
- `module_order`: Integer
- `is_locked`: Boolean, default=True

**Done condition:** Both model classes defined and importable.

---

### Step 3.4 — Create `app/models/lesson.py`

**`lessons`**
- `id`: String PK
- `module_id`: String FK → `modules.id`
- `title`: String
- `lesson_order`: Integer
- `content`: Text, nullable=True
- `summary`: Text, nullable=True
- `references`: JSON, nullable=True
- `youtube_links`: JSON, nullable=True
- `hobby_explanation`: Text, nullable=True
- `generation_status`: String, default="pending"
- `created_at`: DateTime

**`lesson_progress`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `lesson_id`: String FK → `lessons.id`
- `completed`: Boolean, default=False
- `completed_at`: DateTime, nullable=True

**Done condition:** Both model classes defined and importable.

---

### Step 3.5 — Create `app/models/quiz.py`

**`quizzes`**
- `id`: String PK
- `module_id`: String FK → `modules.id`, nullable=True
- `title`: String
- `passing_score`: Integer, default=70

**`quiz_questions`**
- `id`: String PK
- `quiz_id`: String FK → `quizzes.id`
- `question_text`: Text
- `question_type`: String (mcq/truefalse/subjective)
- `options`: JSON, nullable=True
- `correct_answer`: Text
- `explanation`: Text

**`quiz_attempts`**
- `id`: String PK
- `quiz_id`: String FK → `quizzes.id`
- `user_id`: String FK → `users.id`
- `score`: Float
- `passed`: Boolean
- `attempt_number`: Integer, default=1
- `feedback`: Text, nullable=True
- `submitted_at`: DateTime

**`quick_quiz_history`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `subject_id`: String FK → `subjects.id`
- `difficulty`: String
- `score`: Float
- `created_at`: DateTime

**Done condition:** All four model classes defined and importable.

---

### Step 3.6 — Create `app/models/schedule.py`

**`schedules`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `title`: String
- `start_time`: DateTime
- `end_time`: DateTime
- `activity_type`: String (study/quiz/break/hobby)
- `related_subject_id`: String FK → `subjects.id`, nullable=True
- `related_lesson_id`: String FK → `lessons.id`, nullable=True
- `related_quiz_id`: String FK → `quizzes.id`, nullable=True
- `status`: String, default="pending"

**Done condition:** Model class defined and importable.

---

### Step 3.7 — Create `app/models/chat.py`

**`chat_sessions`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `lesson_id`: String FK → `lessons.id`, nullable=True
- `type`: String (tutor/quickask)
- `created_at`: DateTime

**`chat_messages`**
- `id`: String PK
- `session_id`: String FK → `chat_sessions.id`
- `role`: String (user/assistant)
- `message`: Text
- `created_at`: DateTime

**Done condition:** Both model classes defined and importable.

---

### Step 3.8 — Create `app/models/note.py`

**`notes`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `title`: String
- `description`: String, nullable=True
- `content`: Text
- `subject_id`: String FK → `subjects.id`, nullable=True
- `created_at`: DateTime
- `updated_at`: DateTime

**Done condition:** Model class defined and importable.

---

### Step 3.9 — Create `app/models/analytics.py`

**`analytics_snapshots`**
- `id`: String PK
- `user_id`: String FK → `users.id`
- `streak`: Integer, default=0
- `longest_streak`: Integer, default=0
- `avg_quiz_score`: Float, default=0.0
- `completion_rate`: Float, default=0.0
- `study_hours`: Float, default=0.0
- `snapshot_date`: Date

**Done condition:** Model class defined and importable.

---

### Step 3.10 — Update `app/models/__init__.py`

Import all model classes into `__init__.py` so Alembic can detect them:

```python
from app.models.user import User, UserProfile, Hobby, UserHobby
from app.models.subject import Subject, SubjectProgress
from app.models.course import Course, Module
from app.models.lesson import Lesson, LessonProgress
from app.models.quiz import Quiz, QuizQuestion, QuizAttempt, QuickQuizHistory
from app.models.schedule import Schedule
from app.models.chat import ChatSession, ChatMessage
from app.models.note import Note
from app.models.analytics import AnalyticsSnapshot
```

**Done condition:** `from app.models import User, Course, Lesson` all work without error.

---

## PHASE 4 — Alembic Setup and First Migration

### Step 4.1 — Initialize Alembic

Run in `backend/` directory:
```
alembic init alembic
```

**Done condition:** `alembic/env.py`, `alembic/script.py.mako`, and `alembic.ini` exist.

---

### Step 4.2 — Configure `alembic/env.py`

Edit the generated `env.py` to:
1. Import `settings` from `app.core.config`
2. Import `Base` from `app.core.database`
3. Import all models from `app.models` (to ensure they are registered)
4. Set `target_metadata = Base.metadata`
5. Set `config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)`
6. Configure async migration using `asyncio.run()` and `AsyncEngine`

The migration must use the async SQLAlchemy engine since `asyncpg` is the driver.

**Done condition:** `alembic check` does not raise import errors.

---

### Step 4.3 — Generate initial migration

Run:
```
alembic revision --autogenerate -m "initial_schema"
```

Inspect the generated file in `alembic/versions/`. Verify it contains `CREATE TABLE` statements for all 15 tables defined in Phase 3.

**Done condition:** Migration file exists. Contains all expected tables.

---

### Step 4.4 — Apply migration

Ensure PostgreSQL is running and `.env` has correct `DATABASE_URL`. Then run:
```
alembic upgrade head
```

**Done condition:** Command completes without error. All 15 tables exist in the database.

---

## PHASE 5 — Pydantic Schemas

Create request/response schemas. All schemas use Pydantic v2 (`from pydantic import BaseModel`).

---

### Step 5.1 — Create `app/schemas/common.py`

```python
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

def success_response(data) -> dict:
    return {"success": True, "data": data, "error": None}

def error_response(message: str) -> dict:
    return {"success": False, "data": None, "error": message}
```

**Done condition:** `APIResponse` is importable and generic.

---

### Step 5.2 — Create `app/schemas/auth.py`

```python
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str  # min length 8 enforced by validator

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    onboarding_complete: bool

class AuthResponse(BaseModel):
    token: str
    user: UserOut
```

**Done condition:** All four schema classes are importable.

---

### Step 5.3 — Create `app/schemas/onboarding.py`

```python
class AcademicInfoRequest(BaseModel):
    academic_level: str
    major: str

class SubjectInput(BaseModel):
    name: str
    level: str
    priority: int  # 1-10
    weekly_hours: float
    target_weeks: int
    goal: Optional[str] = None

class SubjectsRequest(BaseModel):
    subjects: list[SubjectInput]

class HobbiesRequest(BaseModel):
    hobbies: list[str]

class AvailabilitySlot(BaseModel):
    start: str  # HH:MM
    end: str    # HH:MM

class AvailabilityRequest(BaseModel):
    available_time_slots: list[AvailabilitySlot]

class OnboardingCompleteResponse(BaseModel):
    job_id: str
    message: str
```

**Done condition:** All schema classes importable.

---

### Step 5.4 — Create `app/schemas/subject.py`

```python
class SubjectCreate(BaseModel):
    name: str
    level: str
    priority: int
    weekly_hours: float
    target_weeks: int
    goal: Optional[str] = None

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None
    priority: Optional[int] = None
    weekly_hours: Optional[float] = None
    target_weeks: Optional[int] = None
    goal: Optional[str] = None
    status: Optional[str] = None

class SubjectResponse(BaseModel):
    id: str
    name: str
    priority: int
    level: str
    weekly_hours: float
    target_weeks: int
    user_goal: Optional[str]
    status: str
    progress_percentage: float
    course_id: Optional[str]
    course_generation_status: Optional[str]
```

**Done condition:** All schema classes importable.

---

### Step 5.5 — Create `app/schemas/course.py`

```python
class LessonMetaResponse(BaseModel):
    id: str
    title: str
    lesson_order: int
    generation_status: str
    completed: bool

class ModuleResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    module_order: int
    is_locked: bool
    lessons: list[LessonMetaResponse]

class CourseStructureResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    total_modules: int
    generation_status: str
    modules: list[ModuleResponse]
```

**Done condition:** All schema classes importable.

---

### Step 5.6 — Create `app/schemas/lesson.py`

```python
class LessonResponse(BaseModel):
    id: str
    title: str
    generation_status: str
    content: Optional[str]
    summary: Optional[str]
    hobby_explanation: Optional[str]
    references: Optional[list]
    youtube_links: Optional[list]
    completed: bool
```

**Done condition:** Schema importable.

---

### Step 5.7 — Create `app/schemas/quiz.py`

```python
class QuizGenerateModuleRequest(BaseModel):
    module_id: str
    difficulty: str = "medium"
    question_count: int = 10

class QuizGenerateQuickRequest(BaseModel):
    subject_id: str
    difficulty: str = "medium"
    question_count: int = 10

class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    options: Optional[list[str]]

class QuizResponse(BaseModel):
    id: str
    title: str
    questions: list[QuestionResponse]

class SubmitAnswerItem(BaseModel):
    question_id: str
    answer: str

class QuizSubmitRequest(BaseModel):
    answers: list[SubmitAnswerItem]

class QuizResultResponse(BaseModel):
    quiz_id: str
    score: float
    passed: bool
    feedback: Optional[str]
    question_results: list[dict]
```

**Done condition:** All schema classes importable.

---

### Step 5.8 — Create `app/schemas/schedule.py`

```python
class ScheduleEntryResponse(BaseModel):
    id: str
    title: str
    start_time: datetime
    end_time: datetime
    activity_type: str
    status: str
    related_subject_id: Optional[str]
    related_lesson_id: Optional[str]
    related_quiz_id: Optional[str]

class ScheduleResponse(BaseModel):
    entries: list[ScheduleEntryResponse]

class UpdateScheduleStatusRequest(BaseModel):
    status: str

class RegenerateScheduleRequest(BaseModel):
    feedback: str
```

**Done condition:** All schema classes importable.

---

### Step 5.9 — Create `app/schemas/note.py`

```python
class NoteCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    subject_id: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    subject_id: Optional[str] = None

class NoteResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    content: str
    subject_id: Optional[str]
    subject_name: Optional[str]
    created_at: datetime

class NoteListItem(BaseModel):
    id: str
    title: str
    description: Optional[str]
    subject_id: Optional[str]
    subject_name: Optional[str]
    created_at: datetime
```

**Done condition:** All schema classes importable.

---

### Step 5.10 — Create `app/schemas/chat.py`

```python
class TutorChatRequest(BaseModel):
    message: str
    lesson_id: str
    session_id: Optional[str] = None

class TutorChatResponse(BaseModel):
    session_id: str
    response: str
    references: list = []

class QuickAskRequest(BaseModel):
    message: str
    subject_id: Optional[str] = None

class QuickAskResponse(BaseModel):
    response: str
    references: list = []
```

**Done condition:** All schema classes importable.

---

### Step 5.11 — Create `app/schemas/insights.py`

```python
class SubjectProgressItem(BaseModel):
    subject_id: str
    subject_name: str
    progress_percentage: float

class WeeklyStudyItem(BaseModel):
    date: str
    hours: float

class DashboardInsightsResponse(BaseModel):
    current_streak: int
    longest_streak: int
    today_lessons_completed: int
    today_lessons_total: int
    total_study_hours: float
    avg_quiz_score: float
    quiz_completion_rate: float
    subject_progress: list[SubjectProgressItem]
    weekly_study_hours: list[WeeklyStudyItem]

class AIInsightsResponse(BaseModel):
    insights: list[str]
    generated_at: datetime
```

**Done condition:** All schema classes importable.

---

## PHASE 6 — Dependencies File

### Step 6.1 — Create `app/dependencies.py`

Implement three FastAPI dependency functions:

**`get_db()`**
Async generator that yields an `AsyncSession` from `AsyncSessionLocal`. Closes session after request.

**`get_redis()`**
Returns the `redis_client` from `app.core.redis`.

**`get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db))`**
1. Calls `decode_token(token)` — raises `AuthError` if invalid
2. Extracts `user_id` from payload
3. Queries DB for `User` with that ID
4. Raises `AuthError` if user not found
5. Returns `User` model instance

Use `OAuth2PasswordBearer(tokenUrl="/auth/login")` for the token scheme.

**Done condition:** All three functions are importable. `get_current_user` raises `AuthError` on invalid token.

---

## PHASE 7 — Repositories

Each repository takes an `AsyncSession` as constructor argument. All methods are `async`.

---

### Step 7.1 — Create `app/repositories/user_repository.py`

Implement these methods on class `UserRepository`:

```python
async def get_by_id(self, user_id: str) -> User | None
async def get_by_email(self, email: str) -> User | None
async def create(self, email: str, password_hash: str) -> User
async def set_onboarding_complete(self, user_id: str) -> None
async def get_profile(self, user_id: str) -> UserProfile | None
async def upsert_profile(self, user_id: str, data: dict) -> UserProfile
async def get_hobbies(self, user_id: str) -> list[str]
async def upsert_hobbies(self, user_id: str, hobby_names: list[str]) -> int
```

`upsert_hobbies`: For each hobby name, find or create the `Hobby` row, then delete all existing `UserHobby` rows for this user and insert new ones.

**Done condition:** Class exists with all method signatures. No logic errors in signatures.

---

### Step 7.2 — Create `app/repositories/subject_repository.py`

Implement on class `SubjectRepository`:

```python
async def get_all_by_user(self, user_id: str) -> list[Subject]
async def get_by_id(self, subject_id: str) -> Subject | None
async def create(self, user_id: str, data: dict) -> Subject
async def update(self, subject_id: str, data: dict) -> Subject
async def delete(self, subject_id: str) -> None
async def replace_all(self, user_id: str, subjects_data: list[dict]) -> int
async def get_progress(self, subject_id: str) -> SubjectProgress | None
async def upsert_progress(self, user_id: str, subject_id: str, percentage: float) -> None
```

`replace_all`: Deletes all subjects for user, inserts new ones, creates `SubjectProgress` rows with 0.0.

**Done condition:** Class and all method signatures exist.

---

### Step 7.3 — Create `app/repositories/course_repository.py`

Implement on class `CourseRepository`:

```python
async def get_by_subject(self, subject_id: str) -> Course | None
async def get_by_id(self, course_id: str) -> Course | None
async def create(self, subject_id: str, data: dict) -> Course
async def update_status(self, course_id: str, status: str) -> None
async def get_structure(self, course_id: str) -> Course  # with modules and lesson metadata
async def create_module(self, course_id: str, data: dict) -> Module
async def create_lesson_metadata(self, module_id: str, data: dict) -> Lesson
```

**Done condition:** Class and all method signatures exist.

---

### Step 7.4 — Create `app/repositories/lesson_repository.py`

Implement on class `LessonRepository`:

```python
async def get_by_id(self, lesson_id: str) -> Lesson | None
async def update_status(self, lesson_id: str, status: str) -> None
async def save_content(self, lesson_id: str, content_data: dict) -> None
async def get_progress(self, user_id: str, lesson_id: str) -> LessonProgress | None
async def mark_complete(self, user_id: str, lesson_id: str) -> None
async def get_next_lesson(self, user_id: str, current_lesson_id: str) -> Lesson | None
```

**Done condition:** Class and all method signatures exist.

---

### Step 7.5 — Create `app/repositories/quiz_repository.py`

Implement on class `QuizRepository`:

```python
async def create_quiz(self, data: dict) -> Quiz
async def create_questions(self, quiz_id: str, questions: list[dict]) -> None
async def get_quiz_with_questions(self, quiz_id: str) -> Quiz
async def save_attempt(self, data: dict) -> QuizAttempt
async def get_history(self, user_id: str) -> list[QuizAttempt]
async def save_quick_quiz_history(self, data: dict) -> None
```

**Done condition:** Class and all method signatures exist.

---

### Step 7.6 — Create `app/repositories/schedule_repository.py`

Implement on class `ScheduleRepository`:

```python
async def get_by_user(self, user_id: str) -> list[Schedule]
async def get_entry(self, entry_id: str) -> Schedule | None
async def update_status(self, entry_id: str, status: str) -> None
async def delete_pending_future_entries(self, user_id: str) -> None
async def bulk_insert(self, entries: list[dict]) -> None
```

**Done condition:** Class and all method signatures exist.

---

### Step 7.7 — Create `app/repositories/note_repository.py`

Implement on class `NoteRepository`:

```python
async def create(self, user_id: str, data: dict) -> Note
async def get_all_by_user(self, user_id: str, subject_id: str | None = None) -> list[Note]
async def get_by_id(self, note_id: str) -> Note | None
async def update(self, note_id: str, data: dict) -> None
async def delete(self, note_id: str) -> None
```

**Done condition:** Class and all method signatures exist.

---

### Step 7.8 — Create `app/repositories/analytics_repository.py`

Implement on class `AnalyticsRepository`:

```python
async def get_latest_snapshot(self, user_id: str) -> AnalyticsSnapshot | None
async def save_snapshot(self, user_id: str, data: dict) -> None
async def compute_streak(self, user_id: str) -> tuple[int, int]  # (current, longest)
async def compute_completion_rate(self, user_id: str) -> float
async def get_today_lesson_counts(self, user_id: str) -> tuple[int, int]  # (completed, total)
async def get_weekly_study_hours(self, user_id: str) -> list[dict]
```

**Done condition:** Class and all method signatures exist.

---

## PHASE 8 — AI Layer

### Step 8.1 — Create `app/ai/base.py`

```python
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.7
)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=settings.GOOGLE_API_KEY
)
```

Export: `llm`, `embeddings`.

**Done condition:** File is importable without errors (does not make network calls on import).

---

### Step 8.2 — Create AI output schemas

**`app/ai/schemas/course_output.py`**
```python
class LessonMetadataOutput(BaseModel):
    title: str
    lesson_order: int

class ModuleOutput(BaseModel):
    title: str
    description: str
    module_order: int
    lessons: list[LessonMetadataOutput]

class CourseStructureOutput(BaseModel):
    title: str
    description: str
    estimated_weeks: int
    modules: list[ModuleOutput]
```

**`app/ai/schemas/lesson_output.py`**
```python
class LessonContentOutput(BaseModel):
    title: str
    content: str        # main theory in markdown
    summary: str
    hobby_explanation: str
    references: list[str]
    youtube_links: list[str]
```

**`app/ai/schemas/quiz_output.py`**
```python
class QuestionOutput(BaseModel):
    question_text: str
    question_type: str  # mcq, truefalse, subjective
    options: Optional[list[str]]
    correct_answer: str
    explanation: str

class QuizOutput(BaseModel):
    title: str
    questions: list[QuestionOutput]

class EvaluationOutput(BaseModel):
    score: float  # 0-100
    feedback: str
```

**`app/ai/schemas/schedule_output.py`**
```python
class ScheduleEntryOutput(BaseModel):
    title: str
    day_of_week: str
    start_time: str  # HH:MM
    end_time: str
    activity_type: str
    related_lesson_id: Optional[str]
    related_quiz_id: Optional[str]
    related_subject_id: Optional[str]

class ScheduleOutput(BaseModel):
    entries: list[ScheduleEntryOutput]
```

**`app/ai/schemas/insights_output.py`**
```python
class InsightsOutput(BaseModel):
    insights: list[str]
    recommendations: list[str]
```

**Done condition:** All five schema files are importable.

---

### Step 8.3 — Create AI prompts

Create one file per agent in `app/ai/prompts/`. Each file exports a `ChatPromptTemplate`.

**`course_prompts.py`**
Export `COURSE_GENERATION_PROMPT`. The template must instruct the LLM to generate a structured course outline (with modules and lesson titles) given: subject name, academic level, major, goal, duration in weeks, weekly hours, and user level. Must request JSON output matching `CourseStructureOutput`.

**`lesson_prompts.py`**
Export `LESSON_GENERATION_PROMPT`. Template variables: `lesson_title`, `module_context`, `subject`, `academic_level`, `hobbies`. Must request JSON output matching `LessonContentOutput`. Include instruction to incorporate a hobby-based analogy in the `hobby_explanation` field.

**`tutor_prompts.py`**
Export `TUTOR_SYSTEM_PROMPT`. A system message establishing the tutor persona: helpful, uses hobby-based analogies, stays focused on the current lesson context. Template variables: `lesson_content`, `user_level`, `hobbies`.

**`quiz_prompts.py`**
Export `QUIZ_GENERATION_PROMPT`. Template variables: `content`, `difficulty`, `question_count`, `question_types`. Must request JSON output matching `QuizOutput`.

**`schedule_prompts.py`**
Export `SCHEDULE_GENERATION_PROMPT`. Template variables: `subjects_summary`, `available_slots`, `all_lessons`. Must enforce schedule constraints from architecture document section 11 (break every 90 min, priority-based distribution, no lesson before prerequisite).

**`insights_prompts.py`**
Export `INSIGHTS_GENERATION_PROMPT`. Template variables: `analytics_data`. Must return JSON matching `InsightsOutput`.

**Done condition:** All six prompt files are importable. Each exports a `ChatPromptTemplate` instance.

---

### Step 8.4 — Create `app/ai/agents/course_agent.py`

```python
class CourseAgent:
    def __init__(self, llm=llm):
        self.llm = llm
        # Build LangChain chain: COURSE_GENERATION_PROMPT | llm | PydanticOutputParser(CourseStructureOutput)

    async def generate(self, subject_name: str, academic_level: str, major: str,
                        goal: str, target_weeks: int, weekly_hours: float,
                        level: str) -> CourseStructureOutput:
        # Invoke chain with inputs
        # Return CourseStructureOutput
        # Raise AIGenerationError on failure
```

**Done condition:** Class defined with correct signature. Chain is assembled (not invoked in tests yet).

---

### Step 8.5 — Create `app/ai/agents/lesson_agent.py`

```python
class LessonAgent:
    def __init__(self, llm=llm):
        self.llm = llm
        # Build chain: LESSON_GENERATION_PROMPT | llm | PydanticOutputParser(LessonContentOutput)

    async def generate(self, lesson_title: str, module_context: str,
                        subject: str, academic_level: str,
                        hobbies: list[str]) -> LessonContentOutput:
        # Invoke chain
        # Return LessonContentOutput
        # Raise AIGenerationError on failure
```

**Done condition:** Class defined with correct signature.

---

### Step 8.6 — Create `app/ai/agents/tutor_agent.py`

```python
class TutorAgent:
    def __init__(self, llm=llm):
        self.llm = llm
        # Build a ConversationalRetrievalChain using TUTOR_SYSTEM_PROMPT

    async def chat(self, message: str, lesson_content: str,
                   chat_history: list[dict], retrieved_chunks: list[str],
                   user_level: str, hobbies: list[str]) -> str:
        # Combine context: lesson_content + retrieved_chunks
        # Build message with chat history
        # Invoke chain
        # Return response string
        # Raise AIGenerationError on failure
```

**Done condition:** Class defined with correct signature.

---

### Step 8.7 — Create `app/ai/agents/quiz_agent.py`

```python
class QuizAgent:
    def __init__(self, llm=llm):
        self.llm = llm

    async def generate(self, content: str, difficulty: str,
                       question_count: int) -> QuizOutput:
        # Invoke chain
        # Return QuizOutput
```

**Done condition:** Class defined with correct signature.

---

### Step 8.8 — Create `app/ai/agents/quiz_evaluation_agent.py`

```python
class QuizEvaluationAgent:
    def __init__(self, llm=llm):
        self.llm = llm

    async def evaluate(self, question: str, expected_answer: str,
                       user_answer: str) -> EvaluationOutput:
        # Returns EvaluationOutput with score (0-100) and feedback
```

**Done condition:** Class defined with correct signature.

---

### Step 8.9 — Create `app/ai/agents/schedule_agent.py`

```python
class ScheduleAgent:
    def __init__(self, llm=llm):
        self.llm = llm

    async def generate(self, subjects_summary: list[dict],
                       available_slots: list[dict],
                       all_lessons: list[dict]) -> ScheduleOutput:
        # Invoke chain with schedule constraints
        # Return ScheduleOutput
```

**Done condition:** Class defined with correct signature.

---

### Step 8.10 — Create `app/ai/agents/insights_agent.py`

```python
class InsightsAgent:
    def __init__(self, llm=llm):
        self.llm = llm

    async def generate(self, analytics_data: dict) -> InsightsOutput:
        # Invoke chain
        # Return InsightsOutput
```

**Done condition:** Class defined with correct signature.

---

## PHASE 9 — Vector Store

### Step 9.1 — Create `app/vectorstore/client.py`

```python
from qdrant_client import QdrantClient
from app.core.config import settings

LESSON_EMBEDDINGS = "lesson_embeddings"
USER_CONTEXT_EMBEDDINGS = "user_context_embeddings"

qdrant_client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY or None)
```

Export: `qdrant_client`, `LESSON_EMBEDDINGS`, `USER_CONTEXT_EMBEDDINGS`.

**Done condition:** File is importable.

---

### Step 9.2 — Create `app/vectorstore/lesson_store.py`

```python
class LessonVectorStore:
    async def upsert(self, lesson_id: str, content_text: str,
                     metadata: dict) -> None:
        # Chunk content using chunk_text()
        # Embed each chunk using embeddings from ai/base.py
        # Upsert into Qdrant LESSON_EMBEDDINGS collection
        # Each point payload: {lesson_id, module_id, subject_id, content_chunk}

    async def search(self, query_text: str, subject_id: str,
                     top_k: int = 5) -> list[str]:
        # Embed query
        # Search Qdrant LESSON_EMBEDDINGS filtered by subject_id
        # Return list of content_chunk strings
```

Export: `lesson_store = LessonVectorStore()`

**Done condition:** Class defined with correct signatures.

---

### Step 9.3 — Create `app/vectorstore/user_context_store.py`

```python
class UserContextStore:
    async def upsert(self, user_id: str, profile_summary: str) -> None:
        # Embed profile_summary
        # Upsert into Qdrant USER_CONTEXT_EMBEDDINGS collection
        # Point ID: user_id, payload: {user_id, summary}
```

Export: `user_context_store = UserContextStore()`

**Done condition:** Class defined with correct signature.

---

## PHASE 10 — Services

Implement one service file at a time. Each service instantiates its repositories internally or accepts them via constructor. Services must never import from `app/api/`.

---

### Step 10.1 — Create `app/services/auth_service.py`

```python
class AuthService:
    async def register(self, email: str, password: str, db: AsyncSession) -> AuthResponse:
        # Check email uniqueness via user_repo.get_by_email → raise ConflictError if exists
        # Validate password length ≥ 8 → raise ValidationError if not
        # Hash password
        # Create user via user_repo.create
        # Create user_profile row (empty)
        # Generate JWT via create_token
        # Return AuthResponse(token=..., user=UserOut(...))

    async def login(self, email: str, password: str, db: AsyncSession) -> AuthResponse:
        # Fetch user by email → raise AuthError if not found
        # Verify password → raise AuthError if wrong
        # Generate JWT
        # Return AuthResponse

    async def get_user_by_id(self, user_id: str, db: AsyncSession) -> User:
        # Fetch user → raise AuthError if not found
        # Return User
```

**Done condition:** Service class defined with all three methods.

---

### Step 10.2 — Create `app/services/onboarding_service.py`

```python
class OnboardingService:
    async def save_academic(self, user_id: str, data: AcademicInfoRequest, db: AsyncSession) -> None
    async def save_subjects(self, user_id: str, data: SubjectsRequest, db: AsyncSession) -> int
    async def save_hobbies(self, user_id: str, data: HobbiesRequest, db: AsyncSession) -> int
    async def save_availability(self, user_id: str, data: AvailabilityRequest, db: AsyncSession) -> None
    async def complete_onboarding(self, user_id: str, db: AsyncSession, redis) -> str:
        # Validate: check that academic, subjects, hobbies, availability are all saved
        # Set user.onboarding_complete = True
        # Generate job_id
        # Store in Redis: set_json(f"job:{job_id}", {"status": "pending", "error": None}, ttl=86400)
        # Return job_id (background task triggered from API layer)
```

**Done condition:** Service class defined with all five methods.

---

### Step 10.3 — Create `app/services/subject_service.py`

```python
class SubjectService:
    async def list_subjects(self, user_id: str, db: AsyncSession) -> list[SubjectResponse]
    async def get_subject(self, subject_id: str, user_id: str, db: AsyncSession) -> SubjectResponse
    async def create_subject(self, user_id: str, data: SubjectCreate, db: AsyncSession) -> SubjectResponse
    async def update_subject(self, subject_id: str, user_id: str, data: SubjectUpdate, db: AsyncSession) -> SubjectResponse
    async def delete_subject(self, subject_id: str, user_id: str, db: AsyncSession) -> None
```

For `get_subject`, `update_subject`, `delete_subject`: verify `subject.user_id == user_id` → raise `ForbiddenError` if not.

**Done condition:** Service class defined with all five methods.

---

### Step 10.4 — Create `app/services/course_service.py`

```python
class CourseService:
    async def get_course_by_subject(self, subject_id: str, user_id: str, db: AsyncSession) -> Course
    async def get_course_structure(self, course_id: str, user_id: str, db: AsyncSession) -> CourseStructureResponse
```

`get_course_structure` must join modules and lesson metadata. Include `completed` boolean for each lesson (from `lesson_progress` for this user).

**Done condition:** Service class defined with both methods.

---

### Step 10.5 — Create `app/services/lesson_service.py`

```python
class LessonService:
    async def get_lesson(self, lesson_id: str, user_id: str, db: AsyncSession) -> LessonResponse:
        # Check generation_status:
        # - "complete" → return existing content
        # - "generating" → return 202-style response with status
        # - "pending" or "failed" → set to "generating", call lesson_agent.generate(),
        #   save content, upsert to Qdrant, set status "complete", return content
        # Include completed bool from lesson_progress

    async def mark_complete(self, lesson_id: str, user_id: str, db: AsyncSession) -> None
    async def get_next_lesson(self, user_id: str, current_lesson_id: str, db: AsyncSession) -> Lesson | None
```

**Done condition:** Service class defined with all three methods.

---

### Step 10.6 — Create `app/services/quiz_service.py`

```python
class QuizService:
    async def generate_module_quiz(self, module_id: str, user_id: str,
                                   difficulty: str, question_count: int,
                                   db: AsyncSession) -> QuizResponse
    async def generate_quick_quiz(self, subject_id: str, user_id: str,
                                  difficulty: str, question_count: int,
                                  db: AsyncSession) -> QuizResponse
    async def submit_quiz(self, quiz_id: str, user_id: str,
                          answers: list[SubmitAnswerItem], db: AsyncSession) -> QuizResultResponse
    async def get_history(self, user_id: str, db: AsyncSession) -> list[dict]
```

`submit_quiz`: MCQ and True/False are graded deterministically (exact match). Subjective answers go through `QuizEvaluationAgent`.

**Done condition:** Service class defined with all four methods.

---

### Step 10.7 — Create `app/services/schedule_service.py`

```python
class ScheduleService:
    async def get_schedule(self, user_id: str, db: AsyncSession) -> ScheduleResponse
    async def update_status(self, entry_id: str, user_id: str, status: str, db: AsyncSession) -> None
    async def regenerate_schedule(self, user_id: str, feedback: str, db: AsyncSession) -> None:
        # Delete pending future entries
        # Fetch user profile, subjects, all lessons
        # Call schedule_agent.generate()
        # Bulk insert new entries
```

**Done condition:** Service class defined with all three methods.

---

### Step 10.8 — Create `app/services/chat_service.py`

```python
class ChatService:
    async def tutor_chat(self, user_id: str, message: str, lesson_id: str,
                          session_id: str | None, db: AsyncSession,
                          redis) -> TutorChatResponse:
        # Get or create chat session
        # Load chat history from Redis (key: f"chat:{session_id}")
        # Fetch lesson content from DB
        # Search Qdrant for relevant chunks
        # Fetch user profile (level, hobbies)
        # Call tutor_agent.chat()
        # Save message + response to Redis (update history, TTL 2 hours)
        # Save message + response to DB (chat_messages table)
        # Return TutorChatResponse

    async def quick_ask(self, user_id: str, message: str, subject_id: str | None,
                         db: AsyncSession) -> QuickAskResponse:
        # No session, no Qdrant retrieval
        # Fetch user profile
        # Call LLM directly with simple prompt
        # Return QuickAskResponse
```

**Done condition:** Service class defined with both methods.

---

### Step 10.9 — Create `app/services/note_service.py`

```python
class NoteService:
    async def create(self, user_id: str, data: NoteCreate, db: AsyncSession) -> NoteResponse
    async def list_notes(self, user_id: str, subject_id: str | None, db: AsyncSession) -> list[NoteListItem]
    async def get_note(self, note_id: str, user_id: str, db: AsyncSession) -> NoteResponse
    async def update_note(self, note_id: str, user_id: str, data: NoteUpdate, db: AsyncSession) -> None
    async def delete_note(self, note_id: str, user_id: str, db: AsyncSession) -> None
```

Ownership check on `get_note`, `update_note`, `delete_note`: raise `ForbiddenError` if `note.user_id != user_id`.

**Done condition:** Service class defined with all five methods.

---

### Step 10.10 — Create `app/services/insights_service.py`

```python
class InsightsService:
    async def get_dashboard_insights(self, user_id: str, db: AsyncSession) -> DashboardInsightsResponse:
        # Read from analytics_repository (streak, rates)
        # Read today's lesson counts
        # Read weekly study hours
        # Return DashboardInsightsResponse (no AI call)

    async def get_ai_report(self, user_id: str, db: AsyncSession) -> AIInsightsResponse:
        # Aggregate analytics data
        # Call insights_agent.generate()
        # Return AIInsightsResponse
```

**Done condition:** Service class defined with both methods.

---

### Step 10.11 — Create `app/services/profile_service.py`

```python
class ProfileService:
    async def get_profile(self, user_id: str, db: AsyncSession) -> dict
    async def update_profile(self, user_id: str, data: dict, db: AsyncSession) -> None:
        # Update user_profile fields if provided
        # Update hobbies if provided
        # Update subject fields if provided (do not create/delete subjects here)
```

**Done condition:** Service class defined with both methods.

---

## PHASE 11 — Background Jobs

### Step 11.1 — Create `app/background/onboarding_jobs.py`

```python
async def run_post_onboarding_setup(user_id: str, job_id: str) -> None:
    """
    Steps:
    1. Open new DB session (cannot use request session — this runs after request ends)
    2. Set job status to "running" in Redis
    3. Fetch user_profile, subjects, hobbies from DB
    4. For each subject:
       a. Call CourseAgent.generate() with subject data + user profile
       b. Save course to DB (course, modules, lesson metadata rows)
    5. Call ScheduleAgent.generate() with all courses + user availability
    6. Save all schedule entries to DB
    7. Call user_context_store.upsert() with profile summary
    8. Set job status to "complete" in Redis
    On any exception:
    - Set job status to "failed" in Redis
    - Log the error
    """
```

This function must open its own DB session using `AsyncSessionLocal()` — it cannot use dependency injection because it runs outside the request lifecycle.

**Done condition:** Function defined with correct signature and step comments.

---

## PHASE 12 — API Routers

Each router file: one `APIRouter` instance, endpoint functions only (no logic), calls the corresponding service.

All response bodies must use `success_response(data)` from `app.schemas.common`.

All exception types from `app.core.exceptions` must be caught by the global handler in `main.py` (implemented in next phase) — routers must NOT catch these.

---

### Step 12.1 — Create `app/api/auth.py`

Router prefix: `/auth`

```
POST /auth/register  → auth_service.register()   → 201
POST /auth/login     → auth_service.login()       → 200
GET  /auth/me        → returns current user from get_current_user dep → 200
```

**Done condition:** Three endpoints defined with correct HTTP methods and status codes.

---

### Step 12.2 — Create `app/api/onboarding.py`

Router prefix: `/onboarding`

```
POST /onboarding/academic      → onboarding_service.save_academic()      → 200
POST /onboarding/subjects      → onboarding_service.save_subjects()      → 200
POST /onboarding/hobbies       → onboarding_service.save_hobbies()       → 200
POST /onboarding/availability  → onboarding_service.save_availability()  → 200
POST /onboarding/complete      → onboarding_service.complete_onboarding()
                                 + background_tasks.add_task(run_post_onboarding_setup, ...)
                                 → 202
```

The `complete` endpoint receives `BackgroundTasks` as a parameter and adds the task after the service returns the job_id.

**Done condition:** Five endpoints defined.

---

### Step 12.3 — Create `app/api/jobs.py`

Router prefix: `/jobs`

```
GET /jobs/{job_id} → reads from Redis using get_json(f"job:{job_id}")
                   → raises NotFoundError if None
                   → returns job status → 200
```

**Done condition:** One endpoint defined.

---

### Step 12.4 — Create `app/api/subjects.py`

Router prefix: `/subjects`

```
GET    /subjects          → subject_service.list_subjects()   → 200
GET    /subjects/{id}     → subject_service.get_subject()     → 200
POST   /subjects          → subject_service.create_subject()  → 201
PUT    /subjects/{id}     → subject_service.update_subject()  → 200
DELETE /subjects/{id}     → subject_service.delete_subject()  → 200
```

**Done condition:** Five endpoints defined.

---

### Step 12.5 — Create `app/api/courses.py`

Router prefix: `/courses`

```
GET /courses/by-subject/{subject_id}  → course_service.get_course_by_subject() → 200
GET /courses/{course_id}/structure    → course_service.get_course_structure()  → 200
```

**Done condition:** Two endpoints defined.

---

### Step 12.6 — Create `app/api/lessons.py`

Router prefix: `/lessons`

```
GET  /lessons/{lesson_id}          → lesson_service.get_lesson()      → 200 or 202
POST /lessons/{lesson_id}/complete → lesson_service.mark_complete()   → 200
GET  /lessons/next                 → lesson_service.get_next_lesson() → 200
```

**Note:** When lesson `generation_status` is "generating", return HTTP 202 with the standard envelope containing `{"status": "generating"}`.

**Done condition:** Three endpoints defined.

---

### Step 12.7 — Create `app/api/quizzes.py`

Router prefix: `/quiz`

```
POST /quiz/generate/module  → quiz_service.generate_module_quiz() → 201
POST /quiz/generate/quick   → quiz_service.generate_quick_quiz()  → 201
POST /quiz/{quiz_id}/submit → quiz_service.submit_quiz()          → 200
GET  /quiz/history          → quiz_service.get_history()          → 200
```

**Done condition:** Four endpoints defined.

---

### Step 12.8 — Create `app/api/schedule.py`

Router prefix: `/schedule`

```
GET   /schedule              → schedule_service.get_schedule()       → 200
PATCH /schedule/{id}/status  → schedule_service.update_status()      → 200
POST  /schedule/regenerate   → schedule_service.regenerate_schedule() → 202
```

**Done condition:** Three endpoints defined.

---

### Step 12.9 — Create `app/api/chat.py`

Router prefix: `/ai`

```
POST /ai/tutor/chat  → chat_service.tutor_chat() → 200
POST /ai/quick-ask   → chat_service.quick_ask()  → 200
```

**Done condition:** Two endpoints defined.

---

### Step 12.10 — Create `app/api/notes.py`

Router prefix: `/notes`

```
POST   /notes          → note_service.create()       → 201
GET    /notes          → note_service.list_notes()   → 200
GET    /notes/{id}     → note_service.get_note()     → 200
PUT    /notes/{id}     → note_service.update_note()  → 200
DELETE /notes/{id}     → note_service.delete_note()  → 200
```

**Done condition:** Five endpoints defined.

---

### Step 12.11 — Create `app/api/insights.py`

Router prefix: `/insights`

```
GET /insights/dashboard → insights_service.get_dashboard_insights() → 200
GET /insights/report    → insights_service.get_ai_report()          → 200
```

**Done condition:** Two endpoints defined.

---

### Step 12.12 — Create `app/api/profile.py`

Router prefix: `/profile`

```
GET /profile → profile_service.get_profile() → 200
PUT /profile → profile_service.update_profile() → 200
```

**Done condition:** Two endpoints defined.

---

### Step 12.13 — Create `app/api/state.py` (dashboard state endpoint)

Router prefix: (none — root level)

```
GET /state → aggregates user, profile, hobbies, subjects with course info,
             upcoming schedule (next 7 days), stats, last_active_lesson_id → 200
```

This endpoint calls multiple repositories/services to assemble the response defined in API spec section 4.1. No new service file needed — implement directly in the router using existing services.

**Done condition:** One endpoint defined with correct response shape.

---

## PHASE 13 — Main Application Entry Point

### Step 13.1 — Create `app/main.py`

```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Import all routers
# Import all exception types from core.exceptions

app = FastAPI(title="EveAI API", version="1.0.0")

# CORS middleware: allow FRONTEND_URL origin, allow all methods and headers
app.add_middleware(CORSMiddleware, ...)

# Register all routers with their prefixes
app.include_router(auth_router, prefix="/auth")
app.include_router(onboarding_router, prefix="/onboarding")
# ... all 12 routers

# Global exception handler:
# Catches NotFoundError → 404
# Catches ForbiddenError → 403
# Catches AuthError → 401
# Catches ConflictError → 409
# Catches AIGenerationError → 500
# Catches ValidationError → 400
# Catches all other Exception → 500
# All return: {"success": false, "data": null, "error": "<message>"}

# Startup event: verify DB connection, verify Redis connection

@app.get("/health")
async def health(): return {"status": "ok"}
```

**Done condition:** Server starts with `uvicorn app.main:app --reload` without import errors. `GET /health` returns `{"status": "ok"}`.

---

## PHASE 14 — End-to-End Verification

Run each check in sequence. All must pass before frontend implementation begins.

### Check 14.1 — Auth flow
```
POST /auth/register    → returns token + user with onboarding_complete: false
POST /auth/login       → returns token
GET  /auth/me          → returns user object (with Bearer token)
GET  /auth/me          → returns 401 with no token
```

### Check 14.2 — Onboarding flow
```
POST /onboarding/academic     → {"saved": true}
POST /onboarding/subjects     → {"subjects_saved": N}
POST /onboarding/hobbies      → {"hobbies_saved": N}
POST /onboarding/availability → {"saved": true}
POST /onboarding/complete     → {"job_id": "uuid", "message": "..."}
GET  /jobs/{job_id}           → {"status": "pending"} then eventually "complete"
```

### Check 14.3 — Subject CRUD
```
GET    /subjects       → returns empty list initially
POST   /subjects       → creates subject, returns it
GET    /subjects/{id}  → returns subject
PUT    /subjects/{id}  → updates and returns subject
DELETE /subjects/{id}  → deletes, returns success
```

### Check 14.4 — Course and lesson
```
GET /courses/by-subject/{id}   → returns course (generated during onboarding)
GET /courses/{id}/structure    → returns modules with lesson metadata
GET /lessons/{id}              → triggers generation if needed, returns lesson content
POST /lessons/{id}/complete    → marks lesson complete
```

### Check 14.5 — Jobs endpoint
```
GET /jobs/{job_id}   → returns status from Redis
GET /jobs/invalid    → returns 404
```

### Check 14.6 — Server errors
Verify that hitting a route with an invalid token returns 401 with `{"success": false, "error": "..."}` — not a 500 or unformatted error.

---

## IMPLEMENTATION COMPLETE

At this point the backend is fully scaffolded, all layers are connected, and end-to-end flows are verified. The frontend implementation document may now begin.