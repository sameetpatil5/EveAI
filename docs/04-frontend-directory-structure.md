# EveAI — Frontend Directory Structure Document

---

## Full Structure

```
frontend/
│
├── public/
│   └── favicon.ico
│
├── src/
│   │
│   ├── main.tsx
│   ├── App.tsx
│   │
│   ├── app/
│   │   ├── routes.tsx
│   │   └── layouts/
│   │       ├── AuthLayout.tsx
│   │       ├── AppLayout.tsx
│   │       └── LearningLayout.tsx
│   │
│   ├── features/
│   │   │
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── auth.api.ts
│   │   │   ├── auth.queries.ts
│   │   │   ├── auth.store.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── onboarding/
│   │   │   ├── pages/
│   │   │   │   └── OnboardingPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── StepAcademic.tsx
│   │   │   │   ├── StepSubjects.tsx
│   │   │   │   ├── StepHobbies.tsx
│   │   │   │   ├── StepAvailability.tsx
│   │   │   │   ├── StepFinish.tsx
│   │   │   │   └── OnboardingProgress.tsx
│   │   │   ├── onboarding.api.ts
│   │   │   └── onboarding.types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── WelcomeSection.tsx
│   │   │   │   ├── StatsRow.tsx
│   │   │   │   ├── SubjectProgressList.tsx
│   │   │   │   ├── UpcomingLessons.tsx
│   │   │   │   ├── ContinueLearningCard.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── GeneratingBanner.tsx
│   │   │   ├── dashboard.api.ts
│   │   │   ├── dashboard.queries.ts
│   │   │   └── dashboard.types.ts
│   │   │
│   │   ├── subjects/
│   │   │   ├── pages/
│   │   │   │   └── SubjectsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── SubjectCard.tsx
│   │   │   │   └── AddSubjectModal.tsx
│   │   │   ├── subjects.api.ts
│   │   │   ├── subjects.queries.ts
│   │   │   └── subjects.types.ts
│   │   │
│   │   ├── course/
│   │   │   ├── pages/
│   │   │   │   └── CoursePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── CourseSidebar.tsx
│   │   │   │   ├── ModuleSection.tsx
│   │   │   │   ├── LessonItem.tsx
│   │   │   │   └── CourseGeneratingState.tsx
│   │   │   ├── course.api.ts
│   │   │   ├── course.queries.ts
│   │   │   ├── course.store.ts
│   │   │   └── course.types.ts
│   │   │
│   │   ├── lesson/
│   │   │   ├── pages/
│   │   │   │   └── LessonPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── LessonContent.tsx
│   │   │   │   ├── LessonHeader.tsx
│   │   │   │   ├── LessonReferences.tsx
│   │   │   │   ├── LessonGeneratingState.tsx
│   │   │   │   └── MarkCompleteButton.tsx
│   │   │   ├── lesson.api.ts
│   │   │   ├── lesson.queries.ts
│   │   │   └── lesson.types.ts
│   │   │
│   │   ├── tutor/
│   │   │   ├── components/
│   │   │   │   ├── TutorPanel.tsx
│   │   │   │   ├── TutorMessageList.tsx
│   │   │   │   ├── TutorMessageBubble.tsx
│   │   │   │   └── TutorInput.tsx
│   │   │   ├── tutor.api.ts
│   │   │   └── tutor.types.ts
│   │   │
│   │   ├── quiz/
│   │   │   ├── pages/
│   │   │   │   ├── ModuleQuizPage.tsx
│   │   │   │   └── QuickQuizPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── QuizQuestion.tsx
│   │   │   │   ├── QuizResults.tsx
│   │   │   │   ├── MCQOption.tsx
│   │   │   │   └── SubjectiveInput.tsx
│   │   │   ├── quiz.api.ts
│   │   │   ├── quiz.queries.ts
│   │   │   ├── quiz.store.ts
│   │   │   └── quiz.types.ts
│   │   │
│   │   ├── schedule/
│   │   │   ├── pages/
│   │   │   │   └── SchedulePage.tsx
│   │   │   ├── components/
│   │   │   │   ├── WeekView.tsx
│   │   │   │   ├── DayColumn.tsx
│   │   │   │   ├── ScheduleEntry.tsx
│   │   │   │   └── RegenerateScheduleModal.tsx
│   │   │   ├── schedule.api.ts
│   │   │   ├── schedule.queries.ts
│   │   │   └── schedule.types.ts
│   │   │
│   │   ├── notes/
│   │   │   ├── pages/
│   │   │   │   └── NotesPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── NoteCard.tsx
│   │   │   │   ├── NoteEditor.tsx
│   │   │   │   └── NoteList.tsx
│   │   │   ├── notes.api.ts
│   │   │   ├── notes.queries.ts
│   │   │   └── notes.types.ts
│   │   │
│   │   ├── insights/
│   │   │   ├── pages/
│   │   │   │   └── InsightsPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ProgressChart.tsx
│   │   │   │   ├── QuizScoreChart.tsx
│   │   │   │   ├── StreakDisplay.tsx
│   │   │   │   └── AIFeedbackCard.tsx
│   │   │   ├── insights.api.ts
│   │   │   ├── insights.queries.ts
│   │   │   └── insights.types.ts
│   │   │
│   │   └── profile/
│   │       ├── pages/
│   │       │   └── ProfilePage.tsx
│   │       ├── components/
│   │       │   ├── AccountSection.tsx
│   │       │   ├── SubjectsSection.tsx
│   │       │   ├── HobbiesSection.tsx
│   │       │   └── PreferencesSection.tsx
│   │       ├── profile.api.ts
│   │       ├── profile.queries.ts
│   │       └── profile.types.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── Textarea.tsx
│   │   └── shared/
│   │       ├── ProtectedRoute.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── PageLoader.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── learning.store.ts
│   │
│   └── lib/
│       ├── apiClient.ts
│       ├── queryClient.ts
│       ├── constants.ts
│       └── utils.ts
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

---

## File-by-File Explanation

---

### `src/main.tsx`

The React app entry point. Mounts the app into the DOM.

Wraps the entire app with:
- `QueryClientProvider` from TanStack Query (using the configured client from `lib/queryClient.ts`)
- `BrowserRouter` from React Router
- No other global wrappers needed

---

### `src/App.tsx`

The root component. Imports `routes.tsx` and renders the route tree.

Also contains one side effect on mount: reads the JWT from localStorage, calls
`GET /auth/me` if a token exists, and populates the `authStore`. If the call fails
(expired token), clears localStorage and auth store. This ensures the app always boots
with accurate auth state.

---

### `src/app/routes.tsx`

The complete route tree. Uses React Router v6 nested routes.

All `/app/*` routes are wrapped in `ProtectedRoute`. Inside that, routes are split into
`AppLayout` routes and `LearningLayout` routes. All feature pages are lazy-loaded with
`React.lazy`.

Structure:
```
/                     → LandingPage (AuthLayout)
/auth/login           → LoginPage (AuthLayout)
/auth/register        → RegisterPage (AuthLayout)
/onboarding           → OnboardingPage (no layout)
/app (ProtectedRoute)
  /app/dashboard      → DashboardPage (AppLayout)
  /app/subjects       → SubjectsPage (AppLayout)
  /app/schedule       → SchedulePage (AppLayout)
  /app/notes          → NotesPage (AppLayout)
  /app/insights       → InsightsPage (AppLayout)
  /app/profile        → ProfilePage (AppLayout)
  /app/course/:id     → CoursePage (LearningLayout)
  /app/lesson/:id     → LessonPage (LearningLayout)
  /app/quiz/:quizId   → ModuleQuizPage (AppLayout)
  /app/quick-quiz     → QuickQuizPage (AppLayout)
```

---

### `src/app/layouts/`

**`AuthLayout.tsx`**
Renders a minimal navbar (Logo + "About" link) and a centered content area.
No dashboard links. Used for landing, login, register.

**`AppLayout.tsx`**
Renders the main navbar with links to Dashboard, Subjects, Schedule, Notes, Insights,
Profile. Renders an `<Outlet />` for the page content below.

Also renders a floating Quick Ask button (bottom right) that opens a modal with a
simple chat input — this is available on all AppLayout pages.

**`LearningLayout.tsx`**
Three-column layout. Left sidebar (CourseSidebar), center (`<Outlet />`),
right panel (TutorPanel).

On mount: reads `lessonId` from URL params, calls `learningStore.setActiveLesson()`.
On unmount: clears `learningStore`.

The TutorPanel is always mounted in this layout. It receives `lessonId` from
`learningStore` and re-initializes its chat context when lessonId changes.

---

### `src/features/auth/`

**`pages/LoginPage.tsx`**
Renders LoginForm inside the AuthLayout. On success, calls `authStore.setAuth()` and
navigates to `/app/dashboard`.

**`pages/RegisterPage.tsx`**
Renders RegisterForm. On success, navigates to `/onboarding`.

**`components/LoginForm.tsx`**
Form with email + password fields. Uses local state for form values. On submit, calls
the login mutation from `auth.queries.ts`.

**`components/RegisterForm.tsx`**
Same pattern, calls register mutation.

**`auth.api.ts`**
```
register(email, password) → { token, user }
login(email, password) → { token, user }
getMe() → User
```

**`auth.queries.ts`**
```
useLoginMutation()
useRegisterMutation()
useMeQuery()
```

**`auth.store.ts`**
Re-exported from `stores/auth.store.ts`. The feature imports from here for consistency,
but the actual store is defined in `stores/`.

**`auth.types.ts`**
```typescript
interface User { id: string; email: string; onboarding_complete: boolean }
interface AuthResponse { token: string; user: User }
```

---

### `src/features/onboarding/`

**`pages/OnboardingPage.tsx`**
Manages step state (1-5) in local React state using `useState`. Renders the current step
component. Shows `OnboardingProgress` indicator at top.

Does not use TanStack Query or Zustand for step data — it's purely ephemeral wizard state.

Steps:
1. StepAcademic — select academic level + major
2. StepSubjects — add subjects with details (name, level, priority, hours, weeks, goal)
3. StepHobbies — multi-select hobbies
4. StepAvailability — set available time slots
5. StepFinish — triggers `/onboarding/complete`, stores job_id, navigates to dashboard

Each step component calls its API endpoint on "Next" click before advancing.

**`onboarding.api.ts`**
```
saveAcademic(data) → void
saveSubjects(subjects[]) → void
saveHobbies(hobbies[]) → void
saveAvailability(slots[]) → void
completeOnboarding() → { job_id: string }
```

---

### `src/features/dashboard/`

**`pages/DashboardPage.tsx`**
Composes all dashboard section components. On mount, checks `uiStore.onboardingJobId`.
If present, renders `GeneratingBanner` and starts job polling. Once job is complete,
invalidates queries and removes the job ID from `uiStore`.

**`components/GeneratingBanner.tsx`**
Shown when courses are still generating. Shows a spinner and "Preparing your courses"
message. Disappears automatically when job polling returns `complete`.

**`components/StatsRow.tsx`**
Renders: Current Streak, Longest Streak, Today's Lessons, Study Hours, Avg Quiz Score,
Quiz Completion Rate. Data from `useDashboardInsightsQuery()`.

**`components/SubjectProgressList.tsx`**
Renders progress bars for each subject. Data from `useSubjectsQuery()`.

**`components/UpcomingLessons.tsx`**
Shows Today / Tomorrow / Later schedule entries. Links each entry to `/app/lesson/:id`.
Data from `useScheduleQuery()` filtered to upcoming.

**`components/ContinueLearningCard.tsx`**
Single card showing the last active lesson with a "Resume" button.

**`components/QuickActions.tsx`**
Three buttons: Quick Ask (opens modal), Quick Quiz (navigates to `/app/quick-quiz`),
Browse Subjects (navigates to `/app/subjects`).

**`dashboard.api.ts`**
```
getDashboardState() → DashboardState  // calls GET /state
```

---

### `src/features/subjects/`

**`pages/SubjectsPage.tsx`**
Grid of SubjectCard components. Add Subject button opens `AddSubjectModal`.

**`components/SubjectCard.tsx`**
Shows subject name, progress bar, next lesson title, and "Open Course" button that
navigates to `/app/course/:courseId`.

**`components/AddSubjectModal.tsx`**
Form with all subject fields (name, level, priority, hours, weeks, goal).

---

### `src/features/course/`

**`pages/CoursePage.tsx`**
Rendered inside LearningLayout as the center panel content for the course overview.
Shows course title, description, and an overview of module completion status.

The CourseSidebar component is rendered by LearningLayout, not by this page.

**`components/CourseSidebar.tsx`**
Left panel in LearningLayout. Renders the course module/lesson tree. Fetches course
structure via `useCourseStructureQuery(courseId)`. Shows locked/unlocked state per
module. Clicking a lesson navigates to `/app/lesson/:lessonId`.

**`components/LessonItem.tsx`**
A single lesson entry in the sidebar. Shows: title, completion checkmark, locked icon.

**`course.store.ts`**
```
activeCourseId: string | null
setActiveCourse(id)
```
Set by LearningLayout on mount.

---

### `src/features/lesson/`

**`pages/LessonPage.tsx`**
Center panel content in LearningLayout. Calls `useLessonQuery(lessonId)`.

States:
- Loading: shows `LessonGeneratingState` (spinner + "Generating your personalized lesson…")
- Error: shows error message with retry
- Success: shows `LessonContent` + `MarkCompleteButton`

Because lesson generation can take 5-15 seconds, the loading state is important and
should be clearly communicated.

**`components/LessonContent.tsx`**
Renders the lesson data: title, objectives, theory (markdown rendered), examples,
hobby-based explanation section, summary. Uses a markdown renderer for the theory content.

**`components/LessonReferences.tsx`**
Renders reference links and YouTube video links from lesson data.

**`components/MarkCompleteButton.tsx`**
Only shown if lesson is not yet completed. On click, calls `useMarkCompleteMutation()`,
which invalidates lesson progress and subject progress queries.

---

### `src/features/tutor/`

**`components/TutorPanel.tsx`**
The right panel inside LearningLayout. Always mounted. Contains `TutorMessageList`
and `TutorInput`.

Manages local state: `messages[]`, `isLoading: bool`.

On lessonId change (from `learningStore`): clears messages, optionally loads recent
history if a session exists for this lesson.

**`components/TutorInput.tsx`**
Text input + send button. On submit: appends user message to local state immediately
(optimistic), calls `tutorChat(message, lessonId, sessionId)`, appends response.

**`tutor.api.ts`**
```
tutorChat(message, lessonId, sessionId) → { response: string, session_id: string }
quickAsk(message, subjectId?) → { response: string }
```

Note: The Quick Ask modal in AppLayout uses `quickAsk()`, not `tutorChat()`.

---

### `src/features/quiz/`

**`pages/ModuleQuizPage.tsx`**
Full-screen quiz flow. Steps: loading questions → answering questions → viewing results.
Manages quiz state in `quiz.store.ts`.

**`pages/QuickQuizPage.tsx`**
Simpler flow. Select subject → select difficulty → quiz starts.

**`quiz.store.ts`**
```
questions: Question[]
answers: Record<questionId, string>
submitted: bool
result: QuizResult | null
setAnswer(questionId, answer)
setResult(result)
reset()
```

---

### `src/features/schedule/`

**`pages/SchedulePage.tsx`**
Renders `WeekView`. Shows regenerate button that opens `RegenerateScheduleModal`.

**`components/WeekView.tsx`**
Seven `DayColumn` components (Sunday–Saturday).

**`components/ScheduleEntry.tsx`**
Individual time block. Shows time, activity label, status badge. For study entries,
clicking navigates to the linked lesson.

**`components/RegenerateScheduleModal.tsx`**
Text input: "What should change?" → calls `POST /schedule/regenerate` with feedback.

---

### `src/features/notes/`

**`pages/NotesPage.tsx`**
Two-column: NoteList on left, NoteEditor on right. Clicking a note opens it in the editor.
New Note button creates a blank note in the editor.

**`components/NoteEditor.tsx`**
Fields: Title (text input), Subject (optional select), Content (textarea).
Auto-saves on blur (calls update mutation). Shows "Saved" / "Saving…" indicator.

---

### `src/features/insights/`

**`pages/InsightsPage.tsx`**
Renders charts and the AI feedback card.

**`components/ProgressChart.tsx`**
Line chart of lesson completion over time using a chart library.

**`components/QuizScoreChart.tsx`**
Bar chart of quiz scores per subject.

**`components/AIFeedbackCard.tsx`**
Renders the text insights from `GET /insights/report`. Shows a loading skeleton
while the AI report is being generated.

---

### `src/features/profile/`

**`pages/ProfilePage.tsx`**
Sections: Account, Subjects, Hobbies, Preferences. Each section is its own component
with its own edit state.

---

### `src/components/ui/`

ShadCN/UI component wrappers. These are thin wrapper components — they accept the same
props as ShadCN but can add EveAI-specific defaults (sizing, colors). Never edit the
raw ShadCN primitives directly.

---

### `src/components/shared/`

**`ProtectedRoute.tsx`**
Wraps all `/app/*` routes. Checks `authStore.token`. Redirects to login if absent.
Checks `authStore.user.onboarding_complete`. Redirects to `/onboarding` if false.

**`ErrorBoundary.tsx`**
React ErrorBoundary. Wraps all feature pages. Shows a generic error message with
a reload button on unexpected crashes.

**`PageLoader.tsx`**
Full-page spinner shown by `Suspense` while lazy-loaded route chunks are being loaded.

**`EmptyState.tsx`**
Reusable empty state UI (icon + heading + subtext + optional action button).
Used in Notes, Subjects, Schedule when no data exists yet.

---

### `src/stores/`

**`auth.store.ts`**
Zustand store. Contains: token, user, setAuth, clearAuth.
On `setAuth`: writes token to localStorage.
On `clearAuth`: removes token from localStorage.

**`ui.store.ts`**
Zustand store. Contains: sidebarOpen, tutorPanelOpen, onboardingJobId, activeOnboardingStep.

**`learning.store.ts`**
Zustand store. Contains: activeCourseId, activeLessonId, tutorSessionId.
Set and cleared by LearningLayout.

---

### `src/lib/`

**`apiClient.ts`**
Configured Axios instance. Base URL from `import.meta.env.VITE_API_BASE_URL`.
Request interceptor: attaches Bearer token from authStore.
Response interceptor: unwraps `data` field from envelope, throws on `success: false`.
401 interceptor: clears auth store and redirects to `/auth/login`.

**`queryClient.ts`**
Configured TanStack Query client.
Default stale time: 5 minutes.
Default retry: 1 (don't hammer the server on AI endpoint failures).
Default error handler: logs to console in dev.

**`constants.ts`**
Shared constant values: academic level options, hobby list, subject level options,
schedule status colors, activity type labels.

**`utils.ts`**
Pure utility functions: `formatDate`, `formatDuration`, `getInitials`, `truncate`.

---

### Root Config Files

**`vite.config.ts`**
Standard Vite + React plugin config. Sets `@` as alias for `src/`.

**`tailwind.config.ts`**
Extends ShadCN defaults. Sets content paths to include all `src/` files.

**`tsconfig.json`**
Strict mode enabled. Path aliases configured (`@` → `src/`).

**`.env.example`**
```
VITE_API_BASE_URL=http://localhost:8000
```
