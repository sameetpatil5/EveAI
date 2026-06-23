# EveAI — Frontend Architecture Document

---

## 1. Overview

EveAI's frontend is a React single-page application. It is not a traditional website with
pages — it is a stateful learning OS where the user's current learning state drives every
screen. The architecture reflects this by treating server state and UI state as distinct
concerns, each managed by the right tool.

The frontend is built with React + Vite + TypeScript. Routing is handled by React Router v6.
Server state (API data) is managed by TanStack Query (React Query). UI and user session state
is managed by Zustand.

---

## 2. Confirmed Technology Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| UI state | Zustand |
| UI components | ShadCN/UI + TailwindCSS |
| HTTP client | Axios (configured instance) |
| Auth storage | localStorage (JWT token) |

---

## 3. Architecture Layers

```
┌──────────────────────────────────────────────────────┐
│                     Pages / Views                    │
│  (features/*/pages/)  Route-level components         │
└──────────────────────────────────────────────────────┘
              │ uses
┌──────────────────────────────────────────────────────┐
│                Feature Components                    │
│  (features/*/components/)  Domain-specific UI        │
└──────────────────────────────────────────────────────┘
              │ reads/writes
┌───────────────────────┐  ┌───────────────────────────┐
│    Zustand Stores     │  │    TanStack Query Hooks    │
│  (features/*/*.store) │  │   (features/*/*.queries)  │
│  UI + session state   │  │   Server / API state       │
└───────────────────────┘  └───────────────────────────┘
                                       │ calls
                          ┌────────────────────────────┐
                          │    API Functions Layer      │
                          │   (features/*/*.api.ts)    │
                          │   (lib/apiClient.ts)       │
                          └────────────────────────────┘
                                       │ HTTP
                               FastAPI Backend
```

---

## 4. Three Layout System

All routes are nested under one of three layouts. Layouts are never mixed.

### AuthLayout
Used by: `/`, `/auth/login`, `/auth/register`

Structure:
```
┌──────────────────────────────────┐
│  Minimal navbar (logo + about)   │
├──────────────────────────────────┤
│                                  │
│         Page Content             │
│                                  │
└──────────────────────────────────┘
```

No dashboard links. No sidebar. Clean and distraction-free.

---

### AppLayout
Used by: `/app/dashboard`, `/app/subjects`, `/app/schedule`, `/app/notes`,
`/app/insights`, `/app/profile`

Structure:
```
┌──────────────────────────────────────────────────────┐
│  Logo  Dashboard  Subjects  Schedule  Notes  Profile  │
│                                          [Search off] │
├──────────────────────────────────────────────────────┤
│                                                      │
│                    Page Content                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Navbar is always visible. No sidebar. Full-width content area.

---

### LearningLayout
Used by: `/app/course/:courseId`, `/app/lesson/:lessonId`

Structure:
```
┌──────────────────────────────────────────────────────┐
│  Logo  Dashboard  Subjects  Schedule  (Minimal nav)  │
├──────────┬────────────────────────┬───────────────────┤
│          │                        │                   │
│  Course  │   Lesson Content       │   AI Tutor        │
│ Sidebar  │   (Center Panel)       │   (Right Panel)   │
│  (Left)  │                        │                   │
│          │                        │                   │
└──────────┴────────────────────────┴───────────────────┘
```

Three-panel layout. This is the core of EveAI.
- Left: course module/lesson tree
- Center: lesson content display
- Right: AI Tutor chat (always context-aware)

The three panels are rendered as a single route component. The right panel is always
mounted when inside LearningLayout — it never unmounts between lessons (preserving
chat history within the session).

---

## 5. Routing Design

```
/                           → Landing page (AuthLayout)
/auth/login                 → Login (AuthLayout)
/auth/register              → Register (AuthLayout)
/onboarding                 → Onboarding flow (minimal layout, no nav)
/app                        → Protected zone (AppLayout)
/app/dashboard              → Dashboard
/app/subjects               → Subjects list
/app/course/:courseId       → Course page (LearningLayout)
/app/lesson/:lessonId       → Lesson page (LearningLayout)
/app/schedule               → Schedule
/app/notes                  → Notes
/app/insights               → Insights
/app/profile                → Profile
```

### Route Protection

A `ProtectedRoute` wrapper component checks for a valid JWT in localStorage.
- If no token → redirect to `/auth/login`
- If token exists but user has not completed onboarding → redirect to `/onboarding`
- Otherwise → render the route

The onboarding check uses a field on the user object (`onboarding_complete: bool`)
returned from `GET /auth/me` on app load.

### Onboarding Flow

Onboarding is a multi-step form managed entirely by local component state (not Zustand,
not React Query — it is ephemeral wizard state). It lives at `/onboarding` and uses an
internal step counter to show steps 1-7. Each "Next" button calls its corresponding API
endpoint before advancing. The final step calls `/onboarding/complete`, stores the returned
`job_id` in Zustand's `uiStore`, and redirects to `/app/dashboard`.

---

## 6. State Management Design

Two distinct state systems handle different concerns.

### 6.1 TanStack Query — Server State

All data that comes from the API is managed by TanStack Query. This includes:
- User profile and subjects
- Course structure and lesson content
- Quiz data
- Schedule entries
- Notes
- Insights

TanStack Query handles:
- Caching API responses
- Background refetching
- Loading and error states
- Cache invalidation after mutations

Query keys follow a consistent naming convention:
```
['subjects']                        — all subjects for user
['course', courseId]                — course structure
['lesson', lessonId]                — lesson content
['schedule']                        — weekly schedule
['notes']                          — all notes
['insights']                        — dashboard insights
['job', jobId]                      — background job status
```

The job status query uses `refetchInterval: 5000` and stops when status is `complete`.

### 6.2 Zustand — UI and Session State

Zustand manages state that must persist across route changes within a session but does
not come from the API.

**`authStore`**
```
token: string | null
user: { id, email, onboarding_complete } | null
setAuth(token, user)
clearAuth()
```
On app load, reads token from localStorage, calls `GET /auth/me` to hydrate user.
On login, saves token to localStorage and sets store.
On logout, clears localStorage and resets store.

**`uiStore`**
```
sidebarOpen: bool
tutorPanelOpen: bool
onboardingJobId: string | null
activeOnboardingStep: number
setOnboardingJobId(id)
setSidebarOpen(bool)
```

**`learningStore`**
```
activeCourseId: string | null
activeLessonId: string | null
tutorSessionId: string | null
setActiveLesson(courseId, lessonId)
initTutorSession(lessonId)
```
This store is set when entering LearningLayout and cleared when leaving.
The tutorSessionId ties the chat panel to the correct lesson context.

---

## 7. API Layer Design

### `lib/apiClient.ts`

A single configured Axios instance used by all API functions.

Responsibilities:
- Sets `baseURL` from environment variable
- Attaches `Authorization: Bearer <token>` header on every request by reading from
  `authStore`
- Intercepts 401 responses → clears auth store and redirects to login
- Response interceptor unwraps the `data` field from the standard envelope, so callers
  receive the inner data directly, not the wrapper

### `features/*/[feature].api.ts`

Each feature has its own API file containing plain async functions. These are not hooks —
they are plain functions that return Promises. They are called by TanStack Query hooks.

Example pattern:
```typescript
// lessons.api.ts
export const getLesson = (lessonId: string): Promise<LessonResponse> =>
  apiClient.get(`/lessons/${lessonId}`).then(r => r.data)

export const markLessonComplete = (lessonId: string): Promise<void> =>
  apiClient.post(`/lessons/${lessonId}/complete`).then(r => r.data)
```

### `features/*/[feature].queries.ts`

TanStack Query hooks that wrap the API functions. Components import from here, not from
the API file directly.

Example:
```typescript
// lessons.queries.ts
export const useLessonQuery = (lessonId: string) =>
  useQuery({ queryKey: ['lesson', lessonId], queryFn: () => getLesson(lessonId) })

export const useMarkCompleteMutation = () =>
  useMutation({
    mutationFn: markLessonComplete,
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    }
  })
```

---

## 8. Dashboard — Generating State Handling

When a user arrives at `/app/dashboard` after onboarding, courses may still be generating.

Dashboard checks for `onboardingJobId` in `uiStore`.

If present:
- Renders a "Generating your courses…" banner with a spinner
- Starts a polling query on `GET /jobs/{jobId}` every 5 seconds
- When job status returns `complete`:
  - Removes job ID from `uiStore`
  - Invalidates all subject and course queries
  - Dashboard re-renders with real data

If not present (returning user):
- Renders normally

This means returning users always see a fast dashboard with cached/preloaded data.

---

## 9. AI Tutor Panel Design

The AI Tutor panel lives inside LearningLayout and is always mounted while on a course
or lesson route.

Behavior:
- On lesson open: `learningStore.initTutorSession(lessonId)` is called, which either
  creates a new chat session (via `POST /ai/tutor/chat` with `init: true`) or
  retrieves the existing session for this lesson
- Chat history is loaded from `GET /ai/tutor/session/:sessionId/history`
- Each new message calls `POST /ai/tutor/chat` and appends the response to local state
  (optimistic UI — user message appears immediately, assistant response appears when
  the API call resolves)
- The tutor panel always knows the current `lessonId` from `learningStore` and sends it
  with every message for backend context

The tutor panel does not use TanStack Query for streaming — it uses local component state
for the message list and a loading flag for the in-progress indicator.

---

## 10. Component Design Rules

- Every page-level component is in `features/*/pages/`
- No page imports another feature's components directly (cross-feature via shared `components/`)
- ShadCN/UI components are in `components/ui/` and are never modified — wrap them instead
- Domain-specific composed components (e.g., `LessonCard`, `ModuleSidebar`) live in
  `features/*/components/`
- No component contains raw fetch calls — all data goes through query hooks
- No component writes to a Zustand store unless it's directly responsible for that state

---

## 11. TypeScript Design

- All API response types are in `features/*/[feature].types.ts`
- These types exactly mirror the backend Pydantic schemas
- No `any` types in API layer
- All Zustand stores are fully typed
- All TanStack Query hooks have typed return values

---

## 12. Environment Variables

```
VITE_API_BASE_URL=http://localhost:8000
```

All env vars are prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`.

---

## 13. Performance Approach

- Route-based code splitting via `React.lazy` + `Suspense` for each feature's page
- TanStack Query caching means navigating back to a page does not re-fetch (stale time: 5 min)
- Lesson content is large — it is only fetched when the lesson route is active
- The AI Tutor panel is lazy-loaded only when LearningLayout is mounted
- No premature optimization — no virtualization in V1
