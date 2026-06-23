# EveAI — Complete API Specification Document

---

## Global Rules

**Base URL:** `http://localhost:8000` (development)

**All responses use one envelope:**
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

**Error responses:**
```json
{
  "success": false,
  "data": null,
  "error": "Human-readable description"
}
```

**Authentication:**
All endpoints except `/auth/*` and `/` require:
```
Authorization: Bearer <jwt_token>
```

**HTTP Status Codes:**
- 200 — success
- 201 — created
- 202 — accepted (background job started)
- 400 — bad request / validation error
- 401 — not authenticated
- 403 — forbidden (resource belongs to another user)
- 404 — resource not found
- 409 — conflict (e.g. email already registered)
- 500 — server error / AI generation failure

---

## 1. Authentication

---

### 1.1 Register

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8chars"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "onboarding_complete": false
    }
  },
  "error": null
}
```

**Error Cases:**
- 409 — email already registered
- 400 — password too short (< 8 chars)

---

### 1.2 Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "onboarding_complete": true
    }
  },
  "error": null
}
```

**Error Cases:**
- 401 — invalid email or password

---

### 1.3 Get Current User

```
GET /auth/me
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "onboarding_complete": true
  },
  "error": null
}
```

**Used by:** Frontend on app boot to validate stored token and determine if onboarding is complete.

---

## 2. Onboarding

All onboarding steps are idempotent. Re-submitting overwrites previous values.
Steps can be submitted in any order. `/onboarding/complete` reads all previously saved data.

---

### 2.1 Save Academic Info

```
POST /onboarding/academic
```

**Auth:** Required

**Request Body:**
```json
{
  "academic_level": "B.Tech",
  "major": "Computer Engineering"
}
```

`academic_level` options: "1-10 School", "11-12", "Diploma", "B.Tech", "B.E", "B.Sc",
"BCA", "BA", "M.Tech", "Other"

**Success Response (200):**
```json
{
  "success": true,
  "data": { "saved": true },
  "error": null
}
```

---

### 2.2 Save Subjects

```
POST /onboarding/subjects
```

**Auth:** Required

**Request Body:**
```json
{
  "subjects": [
    {
      "name": "DBMS",
      "level": "advanced",
      "priority": 8,
      "weekly_hours": 6,
      "target_weeks": 4,
      "goal": "Revision for placements"
    },
    {
      "name": "Operating Systems",
      "level": "intermediate",
      "priority": 6,
      "weekly_hours": 4,
      "target_weeks": 6,
      "goal": "Build solid fundamentals"
    }
  ]
}
```

`level` options: "beginner", "intermediate", "advanced"
`priority` range: 1-10

**Behavior:** Replaces all existing subject entries for this user.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "subjects_saved": 2 },
  "error": null
}
```

---

### 2.3 Save Hobbies

```
POST /onboarding/hobbies
```

**Auth:** Required

**Request Body:**
```json
{
  "hobbies": ["Gaming", "Football", "Anime"]
}
```

Accepts any string. Existing hobby names are matched (case-insensitive). New hobby names
are created automatically in the `hobbies` table.

**Success Response (200):**
```json
{
  "success": true,
  "data": { "hobbies_saved": 3 },
  "error": null
}
```

---

### 2.4 Save Availability

```
POST /onboarding/availability
```

**Auth:** Required

**Request Body:**
```json
{
  "available_time_slots": [
    { "start": "18:00", "end": "23:00" }
  ]
}
```

Format: HH:MM (24-hour). User provides when they ARE available (not when they're busy).
Multiple slots allowed (e.g. morning + evening).

**Success Response (200):**
```json
{
  "success": true,
  "data": { "saved": true },
  "error": null
}
```

---

### 2.5 Complete Onboarding

```
POST /onboarding/complete
```

**Auth:** Required

**Request Body:** None

**Behavior:**
1. Validates all previous steps are saved (academic, subjects, hobbies, availability)
2. Sets `onboarding_complete = true` on the user
3. Creates a job status entry in Redis: `{ job_id, status: "pending" }`
4. Triggers BackgroundTask: `run_post_onboarding_setup(user_id, job_id)`
5. Returns immediately with job_id

**Success Response (202):**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "message": "Setup started. Poll /jobs/{job_id} for status."
  },
  "error": null
}
```

**Error Cases:**
- 400 — required onboarding steps not completed

---

## 3. Background Jobs

---

### 3.1 Get Job Status

```
GET /jobs/{job_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "job_id": "uuid",
    "status": "complete",
    "error_message": null
  },
  "error": null
}
```

`status` values: "pending", "running", "complete", "failed"

**Polling behavior:** Frontend polls this endpoint every 5 seconds.
When status is `complete` or `failed`, polling stops.

**Error Cases:**
- 404 — job_id not found (expired or invalid)

---

## 4. User State (Dashboard Boot)

---

### 4.1 Get Full User State

```
GET /state
```

**Auth:** Required

**Purpose:** Single call that loads everything needed to render the dashboard on first load.
Prevents multiple waterfall API calls on page load.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "profile": {
      "full_name": "Sameet",
      "academic_level": "B.Tech",
      "major": "Computer Engineering"
    },
    "hobbies": ["Gaming", "Football"],
    "subjects": [
      {
        "id": "uuid",
        "name": "DBMS",
        "priority": 8,
        "level": "advanced",
        "progress_percentage": 40.0,
        "course_id": "uuid",
        "course_generation_status": "complete"
      }
    ],
    "upcoming_schedule": [
      {
        "id": "uuid",
        "title": "DBMS - Lesson 3",
        "start_time": "2025-01-20T18:00:00",
        "end_time": "2025-01-20T19:00:00",
        "activity_type": "study",
        "status": "pending",
        "related_lesson_id": "uuid"
      }
    ],
    "stats": {
      "current_streak": 5,
      "longest_streak": 12,
      "today_lessons_count": 2,
      "avg_quiz_score": 78.5,
      "completion_rate": 35.2
    },
    "last_active_lesson_id": "uuid"
  },
  "error": null
}
```

---

## 5. Subjects

---

### 5.1 List Subjects

```
GET /subjects
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "id": "uuid",
        "name": "DBMS",
        "level": "advanced",
        "priority": 8,
        "weekly_hours": 6,
        "target_weeks": 4,
        "goal": "Revision for placements",
        "status": "active",
        "progress_percentage": 40.0,
        "course_id": "uuid",
        "course_generation_status": "complete"
      }
    ]
  },
  "error": null
}
```

---

### 5.2 Get Subject Detail

```
GET /subjects/{subject_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "DBMS",
    "level": "advanced",
    "priority": 8,
    "weekly_hours": 6,
    "target_weeks": 4,
    "goal": "Revision for placements",
    "status": "active",
    "progress_percentage": 40.0,
    "course_id": "uuid"
  },
  "error": null
}
```

---

### 5.3 Create Subject

```
POST /subjects
```

**Auth:** Required

**Request Body:**
```json
{
  "name": "Computer Networks",
  "level": "beginner",
  "priority": 5,
  "weekly_hours": 4,
  "target_weeks": 8,
  "goal": "Understand networking for interviews"
}
```

**Behavior:** Creates the subject. Does NOT auto-generate a course. The user must
go to the Subjects page and manually trigger course generation (V2 feature) or it
will be picked up on next onboarding run. For V1, adding new subjects post-onboarding
creates the subject record but the user must contact regeneration manually.

**Note for implementation:** A `POST /subjects/{subject_id}/generate-course` endpoint
can be added in V2. For now, creating a subject just saves it.

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Computer Networks"
  },
  "error": null
}
```

---

### 5.4 Update Subject

```
PUT /subjects/{subject_id}
```

**Auth:** Required

**Request Body (all fields optional):**
```json
{
  "priority": 7,
  "weekly_hours": 5,
  "goal": "Updated goal",
  "level": "intermediate",
  "target_weeks": 6
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { "updated": true },
  "error": null
}
```

---

### 5.5 Delete Subject

```
DELETE /subjects/{subject_id}
```

**Auth:** Required

**Behavior:** Soft-deletes the subject by setting `status = "deleted"`. Course and
lesson data are retained (orphaned but not destroyed).

**Success Response (200):**
```json
{
  "success": true,
  "data": { "deleted": true },
  "error": null
}
```

---

## 6. Courses

---

### 6.1 Get Course by Subject

```
GET /courses/by-subject/{subject_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject_id": "uuid",
    "title": "DBMS for Placement",
    "description": "A focused revision course covering all key DBMS topics.",
    "total_modules": 4,
    "estimated_weeks": 4,
    "generation_status": "complete"
  },
  "error": null
}
```

---

### 6.2 Get Course Structure

```
GET /courses/{course_id}/structure
```

**Auth:** Required

**Purpose:** Returns the full module/lesson tree for the sidebar. Contains lesson
metadata only — no lesson content.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "course_id": "uuid",
    "title": "DBMS for Placement",
    "modules": [
      {
        "id": "uuid",
        "title": "Relational Model",
        "module_order": 1,
        "is_locked": false,
        "lessons": [
          {
            "id": "uuid",
            "title": "Introduction to DBMS",
            "lesson_order": 1,
            "generation_status": "complete",
            "completed": true
          },
          {
            "id": "uuid",
            "title": "Relational Algebra",
            "lesson_order": 2,
            "generation_status": "pending",
            "completed": false
          }
        ],
        "quiz": {
          "id": "uuid",
          "title": "Relational Model Quiz",
          "passing_score": 70,
          "attempts": 0,
          "passed": false
        }
      }
    ]
  },
  "error": null
}
```

---

## 7. Lessons

---

### 7.1 Get Lesson

```
GET /lessons/{lesson_id}
```

**Auth:** Required

**Behavior:**
- If content exists (`generation_status = "complete"`) → return immediately
- If `generation_status = "pending"` or `"failed"` → set to `"generating"`, run
  LessonAgent in background, return 202 with polling instruction
- If `generation_status = "generating"` → return 202 (another request is already generating)

**Success Response when content exists (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Relational Algebra",
    "lesson_order": 2,
    "module_title": "Relational Model",
    "generation_status": "complete",
    "completed": false,
    "content": {
      "objectives": ["Understand relational algebra operators", "Apply selection and projection"],
      "theory": "Full markdown text of lesson theory...",
      "examples": [
        {
          "title": "Example 1",
          "content": "Select all students with GPA > 3.0..."
        }
      ],
      "hobby_explanation": "Think of relational algebra like filtering players in a football team roster...",
      "summary": "Relational algebra provides the formal foundation for SQL queries...",
      "references": [
        { "title": "Database System Concepts", "url": "https://..." }
      ],
      "youtube_links": [
        { "title": "Relational Algebra Explained", "url": "https://youtube.com/..." }
      ]
    }
  },
  "error": null
}
```

**Response when generating (202):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "generation_status": "generating",
    "message": "Lesson is being generated. Poll this endpoint again in 10 seconds."
  },
  "error": null
}
```

**Frontend behavior:** When receiving 202, frontend shows `LessonGeneratingState` and
polls this same endpoint every 5 seconds until status is `complete`.

---

### 7.2 Mark Lesson Complete

```
POST /lessons/{lesson_id}/complete
```

**Auth:** Required

**Request Body:** None

**Behavior:**
- Creates or updates `lesson_progress` row for this user + lesson
- Recalculates and updates `subject_progress.progress_percentage`
- Checks if all lessons in the module are complete → unlocks next module if so

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "completed": true,
    "subject_progress_percentage": 45.0,
    "next_lesson_id": "uuid",
    "module_unlocked": false
  },
  "error": null
}
```

---

### 7.3 Get Next Lesson

```
GET /lessons/next?course_id={course_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "lesson_id": "uuid",
    "title": "SQL SELECT Basics",
    "module_title": "SQL Fundamentals"
  },
  "error": null
}
```

**Error Cases:**
- 404 — no next lesson (course complete)

---

## 8. Quiz System

---

### 8.1 Generate Module Quiz

```
POST /quiz/generate/module
```

**Auth:** Required

**Request Body:**
```json
{
  "module_id": "uuid",
  "difficulty": "medium"
}
```

`difficulty` options: "easy", "medium", "hard"

**Behavior:** Calls QuizAgent with module content. Saves generated quiz + questions to DB.
Returns the full quiz with questions.

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "quiz_id": "uuid",
    "title": "Relational Model Quiz",
    "passing_score": 70,
    "questions": [
      {
        "id": "uuid",
        "question_text": "Which operation returns all tuples satisfying a condition?",
        "question_type": "mcq",
        "options": ["Selection", "Projection", "Union", "Join"],
        "order": 1
      },
      {
        "id": "uuid",
        "question_text": "Projection removes duplicate tuples by default.",
        "question_type": "truefalse",
        "options": null,
        "order": 2
      },
      {
        "id": "uuid",
        "question_text": "Explain the difference between selection and projection.",
        "question_type": "subjective",
        "options": null,
        "order": 3
      }
    ]
  },
  "error": null
}
```

Note: `correct_answer` and `explanation` are NOT returned to the frontend.
They are stored server-side only and used during grading.

---

### 8.2 Generate Quick Quiz

```
POST /quiz/generate/quick
```

**Auth:** Required

**Request Body:**
```json
{
  "subject_id": "uuid",
  "difficulty": "medium",
  "question_count": 5
}
```

`question_count` range: 5-10

**Success Response (201):** Same structure as 8.1 but with 5-10 questions and no `passing_score`
(quick quizzes are not pass/fail).

---

### 8.3 Submit Quiz

```
POST /quiz/{quiz_id}/submit
```

**Auth:** Required

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": "uuid",
      "answer": "Selection"
    },
    {
      "question_id": "uuid",
      "answer": "True"
    },
    {
      "question_id": "uuid",
      "answer": "Selection filters rows while projection filters columns..."
    }
  ]
}
```

**Behavior:**
- MCQ and True/False: graded deterministically against stored `correct_answer`
- Subjective: passed to QuizEvaluationAgent with the expected answer, returns score + feedback
- Calculates total score
- Saves quiz_attempt with all scores and feedback
- If module quiz and score >= passing_score: marks module as unlocked for progression

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt_id": "uuid",
    "score": 80.0,
    "passed": true,
    "attempt_number": 1,
    "results": [
      {
        "question_id": "uuid",
        "correct": true,
        "score": 100,
        "feedback": null
      },
      {
        "question_id": "uuid",
        "correct": false,
        "score": 0,
        "feedback": "Projection does NOT remove duplicates by default in relational algebra."
      },
      {
        "question_id": "uuid",
        "correct": null,
        "score": 75,
        "feedback": "Good understanding of the difference. Could mention attribute retention."
      }
    ],
    "next_module_unlocked": true
  },
  "error": null
}
```

---

### 8.4 Get Quiz History

```
GET /quiz/history
```

**Auth:** Required

**Query Parameters:**
- `subject_id` (optional) — filter by subject
- `limit` (optional, default 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "uuid",
        "quiz_title": "Relational Model Quiz",
        "subject_name": "DBMS",
        "score": 80.0,
        "passed": true,
        "attempt_number": 1,
        "submitted_at": "2025-01-20T19:30:00Z"
      }
    ]
  },
  "error": null
}
```

---

## 9. Schedule

---

### 9.1 Get Schedule

```
GET /schedule
```

**Auth:** Required

**Query Parameters:**
- `week_start` (optional, ISO date) — defaults to current week's Sunday

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "week_start": "2025-01-19",
    "entries": [
      {
        "id": "uuid",
        "title": "DBMS - Introduction to DBMS",
        "start_time": "2025-01-20T18:00:00",
        "end_time": "2025-01-20T19:00:00",
        "activity_type": "study",
        "status": "pending",
        "related_subject_id": "uuid",
        "related_lesson_id": "uuid",
        "related_quiz_id": null
      },
      {
        "id": "uuid",
        "title": "Break",
        "start_time": "2025-01-20T19:00:00",
        "end_time": "2025-01-20T19:15:00",
        "activity_type": "break",
        "status": "pending",
        "related_subject_id": null,
        "related_lesson_id": null,
        "related_quiz_id": null
      }
    ]
  },
  "error": null
}
```

---

### 9.2 Update Schedule Entry Status

```
PATCH /schedule/{schedule_id}/status
```

**Auth:** Required

**Request Body:**
```json
{
  "status": "completed"
}
```

`status` options: "pending", "completed", "missed"

**Success Response (200):**
```json
{
  "success": true,
  "data": { "updated": true },
  "error": null
}
```

---

### 9.3 Regenerate Schedule

```
POST /schedule/regenerate
```

**Auth:** Required

**Request Body:**
```json
{
  "feedback": "I want more time for DBMS and fewer OS sessions this week"
}
```

**Behavior:**
- Deletes all future `status = "pending"` entries
- Reads current progress, completed lessons, available time, subject priorities
- Calls ScheduleAgent with feedback as an additional constraint
- Saves new schedule entries
- Returns new schedule for current week

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Schedule regenerated",
    "entries_created": 18
  },
  "error": null
}
```

---

## 10. AI Chat

---

### 10.1 Tutor Chat

```
POST /ai/tutor/chat
```

**Auth:** Required

**Request Body:**
```json
{
  "message": "I don't understand what natural joins are",
  "lesson_id": "uuid",
  "session_id": "uuid"
}
```

`session_id`: Pass the session_id returned from the first message of this lesson session.
On the very first message for a lesson, omit `session_id` (or pass null) and the backend
will create a new session and return its ID.

**Behavior:**
- Loads chat history from Redis (last 10 messages for this session)
- Retrieves relevant lesson chunks from Qdrant using the message as query
- Calls TutorAgent with: message + lesson context + retrieved chunks + user profile (level, hobbies)
- Saves message + response to Redis (updates history) and to Postgres (permanent)
- Returns response

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "response": "Natural joins are like matching players between two football teams based on a shared attribute — their jersey number. SQL naturally combines rows where the values in the shared column match, without you needing to specify the condition explicitly.",
    "references": []
  },
  "error": null
}
```

---

### 10.2 Quick Ask

```
POST /ai/quick-ask
```

**Auth:** Required

**Request Body:**
```json
{
  "message": "What is the difference between TCP and UDP?",
  "subject_id": "uuid"
}
```

`subject_id` is optional. If provided, the AI uses it to bias the response toward
the user's course context. Can be omitted for fully general questions.

**Behavior:** Simpler than tutor chat. No lesson context, no Qdrant retrieval.
Sends: message + user profile (hobbies, academic level) + optional subject name.
Does not maintain session history (stateless).

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "response": "TCP is like a phone call — connection established, reliable delivery, ordered. UDP is like sending a letter — no guarantee it arrives, but faster...",
    "references": []
  },
  "error": null
}
```

---

## 11. Notes

---

### 11.1 Create Note

```
POST /notes
```

**Auth:** Required

**Request Body:**
```json
{
  "title": "DBMS - Normalization Summary",
  "description": "Key points about 1NF, 2NF, 3NF",
  "content": "# Normalization\n\n## 1NF\nAll attributes must be atomic...",
  "subject_id": "uuid"
}
```

`subject_id` is optional.
`content` is plain markdown text.

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "DBMS - Normalization Summary",
    "created_at": "2025-01-20T20:00:00Z"
  },
  "error": null
}
```

---

### 11.2 List Notes

```
GET /notes
```

**Auth:** Required

**Query Parameters:**
- `subject_id` (optional) — filter by subject

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "title": "DBMS - Normalization Summary",
        "description": "Key points about 1NF, 2NF, 3NF",
        "subject_id": "uuid",
        "subject_name": "DBMS",
        "created_at": "2025-01-20T20:00:00Z"
      }
    ]
  },
  "error": null
}
```

---

### 11.3 Get Note

```
GET /notes/{note_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "DBMS - Normalization Summary",
    "description": "Key points about 1NF, 2NF, 3NF",
    "content": "# Normalization\n\n## 1NF...",
    "subject_id": "uuid",
    "subject_name": "DBMS",
    "created_at": "2025-01-20T20:00:00Z"
  },
  "error": null
}
```

---

### 11.4 Update Note

```
PUT /notes/{note_id}
```

**Auth:** Required

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "content": "Updated content...",
  "subject_id": "uuid"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { "updated": true },
  "error": null
}
```

---

### 11.5 Delete Note

```
DELETE /notes/{note_id}
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": { "deleted": true },
  "error": null
}
```

---

## 12. Insights

---

### 12.1 Get Dashboard Insights

```
GET /dashboard
```

**Auth:** Required

**Purpose:** Returns pre-computed analytics data for the Dashboard stats section.
Reads from `analytics_snapshots` and live `lesson_progress` data. Does NOT call AI.
Fast response, suitable for dashboard boot.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "current_streak": 5,
    "longest_streak": 12,
    "today_lessons_completed": 1,
    "today_lessons_total": 2,
    "total_study_hours": 24.5,
    "avg_quiz_score": 78.5,
    "quiz_completion_rate": 66.7,
    "subject_progress": [
      {
        "subject_id": "uuid",
        "subject_name": "DBMS",
        "progress_percentage": 40.0
      },
      {
        "subject_id": "uuid",
        "subject_name": "Operating Systems",
        "progress_percentage": 20.0
      }
    ],
    "weekly_study_hours": [
      { "date": "2025-01-14", "hours": 3.5 },
      { "date": "2025-01-15", "hours": 2.0 }
    ]
  },
  "error": null
}
```

---

### 12.2 Get AI Insights Report

```
GET /insights/report
```

**Auth:** Required

**Behavior:** Calls InsightsAgent with aggregated data. Returns AI-generated narrative
insights. May take 3-5 seconds. Frontend shows loading skeleton.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "insights": [
      "Your DBMS progress is strong — you've completed 40% in just 2 weeks.",
      "Quiz performance in OS has dropped by 15% over the past 3 quizzes.",
      "You are on a 5-day study streak. Keep it up!",
      "Consider increasing your OS study time by 1 hour per week to stay on target.",
      "Your weakest area appears to be process scheduling in OS — revisit Module 2."
    ],
    "generated_at": "2025-01-20T21:00:00Z"
  },
  "error": null
}
```

---

## 13. Profile

---

### 13.1 Get Profile

```
GET /profile
```

**Auth:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "profile": {
      "full_name": "Sameet",
      "academic_level": "B.Tech",
      "major": "Computer Engineering",
      "available_time_slots": [
        { "start": "18:00", "end": "23:00" }
      ]
    },
    "hobbies": ["Gaming", "Football", "Anime"],
    "subjects": [
      {
        "id": "uuid",
        "name": "DBMS",
        "level": "advanced",
        "priority": 8,
        "weekly_hours": 6,
        "target_weeks": 4,
        "goal": "Revision for placements",
        "status": "active"
      }
    ]
  },
  "error": null
}
```

---

### 13.2 Update Profile

```
PUT /profile
```

**Auth:** Required

**Request Body (all fields optional — only include what's changing):**
```json
{
  "full_name": "Sameet Khatri",
  "available_time_slots": [
    { "start": "19:00", "end": "23:00" }
  ],
  "hobbies": ["Gaming", "Music"],
  "subjects": [
    {
      "id": "uuid",
      "priority": 9,
      "weekly_hours": 7,
      "goal": "Updated placement goal"
    }
  ]
}
```

**Note:** `email` and `password` are not updated here. These are separate flows (not in V1).

**Success Response (200):**
```json
{
  "success": true,
  "data": { "updated": true },
  "error": null
}
```

---

## API Endpoint Summary

| Method | Path                     | Auth | Description                     |
| ------ | ------------------------ | ---- | ------------------------------- |
| POST   | /auth/register           | No   | Register new user               |
| POST   | /auth/login              | No   | Login                           |
| GET    | /auth/me                 | Yes  | Get current user                |
| POST   | /onboarding/academic     | Yes  | Save academic info              |
| POST   | /onboarding/subjects     | Yes  | Save subjects                   |
| POST   | /onboarding/hobbies      | Yes  | Save hobbies                    |
| POST   | /onboarding/availability | Yes  | Save availability               |
| POST   | /onboarding/complete     | Yes  | Trigger AI setup                |
| GET    | /jobs/{job_id}           | Yes  | Poll job status                 |
| GET    | /state                   | Yes  | Get full user state             |
| GET    | /subjects                | Yes  | List subjects                   |
| GET    | /subjects/{id}           | Yes  | Get subject                     |
| POST   | /subjects                | Yes  | Create subject                  |
| PUT    | /subjects/{id}           | Yes  | Update subject                  |
| DELETE | /subjects/{id}           | Yes  | Delete subject                  |
| GET    | /courses/by-subject/{id} | Yes  | Get course by subject           |
| GET    | /courses/{id}/structure  | Yes  | Get course structure            |
| GET    | /lessons/{id}            | Yes  | Get lesson (generate if needed) |
| POST   | /lessons/{id}/complete   | Yes  | Mark lesson complete            |
| GET    | /lessons/next            | Yes  | Get next lesson                 |
| POST   | /quiz/generate/module    | Yes  | Generate module quiz            |
| POST   | /quiz/generate/quick     | Yes  | Generate quick quiz             |
| POST   | /quiz/{id}/submit        | Yes  | Submit quiz answers             |
| GET    | /quiz/history            | Yes  | Get quiz history                |
| GET    | /schedule                | Yes  | Get weekly schedule             |
| PATCH  | /schedule/{id}/status    | Yes  | Update entry status             |
| POST   | /schedule/regenerate     | Yes  | Regenerate schedule             |
| POST   | /ai/tutor/chat           | Yes  | Tutor chat message              |
| POST   | /ai/quick-ask            | Yes  | Quick ask question              |
| POST   | /notes                   | Yes  | Create note                     |
| GET    | /notes                   | Yes  | List notes                      |
| GET    | /notes/{id}              | Yes  | Get note                        |
| PUT    | /notes/{id}              | Yes  | Update note                     |
| DELETE | /notes/{id}              | Yes  | Delete note                     |
| GET    | /dashboard               | Yes  | Dashboard analytics             |
| GET    | /insights/report         | Yes  | AI insights report              |
| GET    | /profile                 | Yes  | Get full profile                |
| PUT    | /profile                 | Yes  | Update profile                  |

**Total endpoints: 38**
