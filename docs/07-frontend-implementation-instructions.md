# EveAI — Frontend Implementation Instructions
**Version:** 1.0
**For:** AI Coding Agent (Claude Code / Copilot)
**Source of Truth:** Architecture documents 03 and 04, API specification document 05, UI Design Specification

---

## HOW TO USE THIS DOCUMENT

- Follow phases in exact order. Do not skip ahead.
- Each step has: **What to create**, **What it must contain**, **Done condition**.
- After every phase, run the listed verification checks before proceeding.
- Never add libraries not listed in the tech stack.
- When a step says "stub", render placeholder text — do not write real logic yet.
- UI colors, spacing, and component appearance follow the UI Design Specification. Architecture always takes priority if there is conflict.

---

## DESIGN TOKENS (reference throughout)

Apply these as Tailwind classes or CSS variables consistently.

| Token           | Value                            |
| --------------- | -------------------------------- |
| Primary Blue    | `#607afb` → `bg-[#607afb]`       |
| Primary Hover   | `#4f63df` → `hover:bg-[#4f63df]` |
| Page Background | `#f8f9fc` → `bg-[#f8f9fc]`       |
| Card Background | `#ffffff` → `bg-white`           |
| Primary Text    | `#0f172a` → `text-[#0f172a]`     |
| Secondary Text  | `#475569` → `text-[#475569]`     |
| Muted Text      | `#64748b` → `text-[#64748b]`     |
| Border          | `#e9eaf2` → `border-[#e9eaf2]`   |
| Success         | `#10b981` → `text-[#10b981]`     |
| Error           | `#991b1b` → `text-[#991b1b]`     |

Base font: Inter. Apply `font-sans` on `<body>`.

---

## PHASE 1 — Project Scaffold

### Step 1.1 — Initialize Vite project

Run:
```
npm create vite@latest frontend -- --template react-ts
cd frontend
```

**Done condition:** `frontend/` directory exists with Vite + React + TypeScript template files.

---

### Step 1.2 — Install dependencies

```
npm install react-router-dom @tanstack/react-query zustand axios
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npm install lucide-react
npm install -D @types/node
npx tailwindcss init -p
```

Install ShadCN/UI following its init process (select tailwind, set path alias `@` → `src`):
```
npx shadcn-ui@latest init
```

When prompted, choose: TypeScript, default style, neutral color, `src/components/ui` for components, CSS variables for theming.

**Done condition:** `package.json` contains all installed packages. `tailwind.config.ts` and `postcss.config.js` exist.

---

### Step 1.3 — Configure `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

**Done condition:** `@` alias resolves to `src/`.

---

### Step 1.4 — Configure `tailwind.config.ts`

Extend the ShadCN base config:
- Set `content` to include `["./index.html", "./src/**/*.{ts,tsx}"]`
- Add Inter as the default sans font (or let it fall back to system sans-serif)
- Keep all ShadCN theme extensions in place

**Done condition:** Tailwind processes classes from all `src/` files.

---

### Step 1.5 — Configure `tsconfig.json`

Ensure:
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**Done condition:** TypeScript resolves `@/` imports.

---

### Step 1.6 — Create `.env.example`

```
VITE_API_BASE_URL=http://localhost:8000
```

Also create `.env` with the same content (for local dev). Add `.env` to `.gitignore`.

**Done condition:** `.env.example` committed. `.env` gitignored.

---

### Step 1.7 — Create full directory structure

Create these empty directories under `src/`:

```
src/
├── app/
│   └── layouts/
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   └── components/
│   ├── onboarding/
│   │   ├── pages/
│   │   └── components/
│   ├── dashboard/
│   │   ├── pages/
│   │   └── components/
│   ├── subjects/
│   │   ├── pages/
│   │   └── components/
│   ├── course/
│   │   ├── pages/
│   │   └── components/
│   ├── lesson/
│   │   ├── pages/
│   │   └── components/
│   ├── tutor/
│   │   └── components/
│   ├── quiz/
│   │   ├── pages/
│   │   └── components/
│   ├── schedule/
│   │   ├── pages/
│   │   └── components/
│   ├── notes/
│   │   ├── pages/
│   │   └── components/
│   ├── insights/
│   │   ├── pages/
│   │   └── components/
│   └── profile/
│       ├── pages/
│       └── components/
├── components/
│   ├── ui/
│   └── shared/
├── stores/
└── lib/
```

Place `.gitkeep` in each empty leaf directory.

**Done condition:** Full directory tree exists.

---

## PHASE 2 — Core Library Files

### Step 2.1 — Create `src/lib/constants.ts`

```typescript
export const ACADEMIC_LEVELS = [
  "1-10 School", "11-12", "Diploma", "B.Tech", "B.E", "B.Sc",
  "BCA", "BA", "M.Tech", "Other"
]

export const SUBJECT_LEVELS = ["beginner", "intermediate", "advanced"]

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  study: "Study",
  quiz: "Quiz",
  break: "Break",
  hobby: "Hobby Time"
}

export const SCHEDULE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  overdue: "bg-orange-100 text-orange-700"
}
```

**Done condition:** All constants exportable.

---

### Step 2.2 — Create `src/lib/utils.ts`

```typescript
export function formatDate(date: string | Date): string
  // Returns formatted date string: "Jan 20, 2025"

export function formatDuration(minutes: number): string
  // Returns: "1h 30m"

export function getInitials(name: string): string
  // Returns first letter of each word, max 2: "Sameet Khatri" → "SK"

export function truncate(text: string, maxLength: number): string
  // Returns text truncated to maxLength with "..." appended if needed
```

Implement all four functions. No dependencies needed.

**Done condition:** All four functions importable and work correctly.

---

### Step 2.3 — Create `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    }
  }
})
```

**Done condition:** `queryClient` is importable.

---

### Step 2.4 — Create `src/lib/apiClient.ts`

```typescript
import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'  // import will be resolved in Phase 3

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Request interceptor: attach Bearer token from authStore
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: unwrap data field, throw on success: false
apiClient.interceptors.response.use(
  (response) => {
    if (response.data.success === false) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data.data  // unwrap inner data
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
    }
    throw error
  }
)

export default apiClient
```

**Done condition:** File created. Interceptors are defined (store import will resolve after Phase 3).

---

## PHASE 3 — Zustand Stores

### Step 3.1 — Create `src/stores/auth.store.ts`

```typescript
import { create } from 'zustand'

interface User {
  id: string
  email: string
  onboarding_complete: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null })
  }
}))
```

**Done condition:** Store is importable. `useAuthStore.getState().token` returns localStorage value on init.

---

### Step 3.2 — Create `src/stores/ui.store.ts`

```typescript
interface UIState {
  sidebarOpen: boolean
  tutorPanelOpen: boolean
  onboardingJobId: string | null
  activeOnboardingStep: number
  setOnboardingJobId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setTutorPanelOpen: (open: boolean) => void
  setActiveOnboardingStep: (step: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  tutorPanelOpen: true,
  onboardingJobId: null,
  activeOnboardingStep: 1,
  setOnboardingJobId: (id) => set({ onboardingJobId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTutorPanelOpen: (open) => set({ tutorPanelOpen: open }),
  setActiveOnboardingStep: (step) => set({ activeOnboardingStep: step })
}))
```

**Done condition:** Store importable with all state and actions.

---

### Step 3.3 — Create `src/stores/learning.store.ts`

```typescript
interface LearningState {
  activeCourseId: string | null
  activeLessonId: string | null
  tutorSessionId: string | null
  setActiveLesson: (courseId: string, lessonId: string) => void
  initTutorSession: (sessionId: string) => void
  clearLearning: () => void
}

export const useLearningStore = create<LearningState>((set) => ({
  activeCourseId: null,
  activeLessonId: null,
  tutorSessionId: null,
  setActiveLesson: (courseId, lessonId) => set({ activeCourseId: courseId, activeLessonId: lessonId }),
  initTutorSession: (sessionId) => set({ tutorSessionId: sessionId }),
  clearLearning: () => set({ activeCourseId: null, activeLessonId: null, tutorSessionId: null })
}))
```

**Done condition:** Store importable with all state and actions.

---

## PHASE 4 — Shared UI Components

Build these before features — features depend on them.

### Step 4.1 — Create `src/components/ui/Button.tsx`

Thin wrapper around ShadCN Button. Add EveAI defaults:
- Default variant: "default" (filled, primary blue `#607afb`)
- Shape: slightly rounded (`rounded-lg`)
- Always includes hover transition

Props: standard ShadCN Button props (`variant`, `size`, `disabled`, `onClick`, `children`, `className`).

**Done condition:** `<Button>Click</Button>` renders a blue button.

---

### Step 4.2 — Create `src/components/ui/Input.tsx`

Thin wrapper around ShadCN Input. Add EveAI defaults:
- Soft background on focus
- Border highlight on focus (`border-[#607afb]`)

Props: all standard HTML input attributes + `label?: string` for displaying a label above the input.

**Done condition:** `<Input label="Email" placeholder="..." />` renders correctly.

---

### Step 4.3 — Create `src/components/ui/Card.tsx`

```tsx
// White card with rounded corners, subtle border, soft shadow
export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-[#e9eaf2] shadow-sm p-6 ${className || ''}`}>
      {children}
    </div>
  )
}
```

**Done condition:** `<Card>Content</Card>` renders a white card with border and shadow.

---

### Step 4.4 — Create `src/components/ui/Modal.tsx`

```tsx
// Centered overlay modal with dimmed background
// Props: open: bool, onClose: () => void, title?: string, children
// Structure: overlay div → centered container → header (title + close button) → body
```

Use a portal (`createPortal`) to render into `document.body`. Background click closes the modal.

**Done condition:** `<Modal open={true} onClose={() => {}}>Content</Modal>` renders an overlay modal.

---

### Step 4.5 — Create `src/components/ui/Spinner.tsx`

```tsx
// Animated spinner using Tailwind animate-spin
// Props: size?: 'sm' | 'md' | 'lg', className?: string
// Default: medium blue spinner
```

**Done condition:** `<Spinner />` renders an animated blue spinner.

---

### Step 4.6 — Create `src/components/ui/Badge.tsx`

```tsx
// Small pill badge
// Props: variant?: 'default' | 'success' | 'warning' | 'error', children
// Each variant has appropriate background/text color from design system
```

**Done condition:** `<Badge variant="success">Complete</Badge>` renders green pill.

---

### Step 4.7 — Create `src/components/ui/Progress.tsx`

```tsx
// Horizontal progress bar
// Props: value: number (0-100), className?: string
// Shows filled bar in primary blue proportional to value
```

**Done condition:** `<Progress value={40} />` renders a 40%-filled blue bar.

---

### Step 4.8 — Create `src/components/ui/Textarea.tsx`

Thin wrapper around ShadCN Textarea. Same focus styling as Input.

**Done condition:** Renders a styled textarea.

---

### Step 4.9 — Create `src/components/shared/Spinner.tsx` (page-level)

> Note: this is `PageLoader`, not the same as the UI spinner.

Create `src/components/shared/PageLoader.tsx`:
```tsx
// Full-page centered spinner
// Used by React Suspense fallback
// Shows Spinner component centered on full viewport height
```

**Done condition:** Renders full-page spinner.

---

### Step 4.10 — Create `src/components/shared/ErrorBoundary.tsx`

```tsx
// Class component (required for error boundaries in React)
// On error: renders centered error message + "Reload" button that calls window.location.reload()
// Props: children
```

**Done condition:** Class component with `componentDidCatch` and fallback UI.

---

### Step 4.11 — Create `src/components/shared/EmptyState.tsx`

```tsx
// Props: icon?: LucideIcon, heading: string, subtext?: string, action?: { label: string, onClick: () => void }
// Centered card-like container with icon, heading, subtext, optional button
```

**Done condition:** `<EmptyState heading="No notes yet" />` renders an empty state UI.

---

### Step 4.12 — Create `src/components/shared/ProtectedRoute.tsx`

```tsx
// Reads from useAuthStore
// If no token → <Navigate to="/auth/login" />
// If token but user is null → show <PageLoader /> (auth is being hydrated)
// If user.onboarding_complete === false → <Navigate to="/onboarding" />
// Otherwise → <Outlet />
```

**Done condition:** Component correctly redirects unauthenticated users.

---

## PHASE 5 — Auth Feature

### Step 5.1 — Create `src/features/auth/auth.types.ts`

```typescript
export interface User {
  id: string
  email: string
  onboarding_complete: boolean
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}
```

**Done condition:** All types exportable.

---

### Step 5.2 — Create `src/features/auth/auth.api.ts`

```typescript
import apiClient from '@/lib/apiClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from './auth.types'

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post('/auth/login', data)

export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  apiClient.post('/auth/register', data)

export const getMe = (): Promise<User> =>
  apiClient.get('/auth/me')
```

**Done condition:** Three functions exportable with correct types.

---

### Step 5.3 — Create `src/features/auth/auth.queries.ts`

```typescript
// useLoginMutation: calls login(), on success calls setAuth() from authStore, navigates to /app/dashboard
// useRegisterMutation: calls register(), on success calls setAuth(), navigates to /onboarding
// Both show error message on failure
```

Use `useMutation` from TanStack Query.

**Done condition:** Both hooks exportable.

---

### Step 5.4 — Create `src/features/auth/components/LoginForm.tsx`

```tsx
// Controlled form with email + password fields
// Submit button calls useLoginMutation
// Shows inline error message on failure
// "Don't have an account? Register" link navigates to /auth/register
// No page layout here — just the form card
```

Visual: white card, centered, max-width ~400px, fields stacked vertically with 16px gap, primary blue submit button.

**Done condition:** Form renders and calls mutation on submit.

---

### Step 5.5 — Create `src/features/auth/components/RegisterForm.tsx`

```tsx
// Controlled form with email + password fields
// Submit button calls useRegisterMutation
// Shows inline error on failure
// "Already have an account? Login" link
```

Same visual style as LoginForm.

**Done condition:** Form renders and calls mutation on submit.

---

### Step 5.6 — Create auth pages

**`src/features/auth/pages/LoginPage.tsx`**
Renders only `<LoginForm />`. No layout logic — layout is handled by `AuthLayout`.

**`src/features/auth/pages/RegisterPage.tsx`**
Renders only `<RegisterForm />`.

**Done condition:** Both page files exist and render their respective form components.

---

## PHASE 6 — Layouts

### Step 6.1 — Create `src/app/layouts/AuthLayout.tsx`

```tsx
// Structure:
// - Minimal navbar: logo text "EveAI" on left, no navigation links
// - Full-height centered content area below navbar
// - Renders <Outlet /> inside centered area
// Background: #f8f9fc
```

**Done condition:** Wraps children in the minimal navbar + centered container structure.

---

### Step 6.2 — Create `src/app/layouts/AppLayout.tsx`

```tsx
// Structure:
// - Top navbar (full width, white, border-bottom):
//   - Left: Logo
//   - Center/Right: Nav links: Dashboard, Subjects, Schedule, Notes, Insights, Profile
//   - Active link highlighted with primary blue
//   - User avatar/initials on far right (from authStore.user)
// - Page content: full-width below navbar, bg-[#f8f9fc]
// - Renders <Outlet /> in content area
// Uses useLocation() to determine active link
```

**Done condition:** Navbar renders with all links. Active link is visually highlighted.

---

### Step 6.3 — Create `src/app/layouts/LearningLayout.tsx`

```tsx
// Structure:
// - Minimal top navbar (same as AppLayout but with fewer links: Dashboard, Subjects only)
// - Three-panel row below navbar:
//   - Left panel (fixed width ~280px): CourseSidebar (imported from course feature)
//   - Center panel (flex-1, overflow-y-auto): renders <Outlet />
//   - Right panel (fixed width ~320px): TutorPanel (imported from tutor feature)
// On mount: reads courseId from route params, calls learningStore.setActiveLesson()
// On unmount: calls learningStore.clearLearning()
```

**Done condition:** Three-panel layout renders correctly. Panels are visible with correct widths.

---

## PHASE 7 — App Router

### Step 7.1 — Create `src/app/routes.tsx`

```tsx
// All feature page components imported with React.lazy()
// Structure:
// /                     → LandingPage (AuthLayout) — stub for now
// /auth/login           → LoginPage (AuthLayout)
// /auth/register        → RegisterPage (AuthLayout)
// /onboarding           → OnboardingPage (no layout wrapper)
// /app (ProtectedRoute)
//   /app/dashboard      → DashboardPage (AppLayout)
//   /app/subjects       → SubjectsPage (AppLayout)
//   /app/schedule       → SchedulePage (AppLayout)
//   /app/notes          → NotesPage (AppLayout)
//   /app/insights       → InsightsPage (AppLayout)
//   /app/profile        → ProfilePage (AppLayout)
//   /app/course/:courseId → CoursePage (LearningLayout)
//   /app/lesson/:lessonId → LessonPage (LearningLayout)
//   /app/quiz/:quizId   → ModuleQuizPage (AppLayout)
//   /app/quick-quiz     → QuickQuizPage (AppLayout)
// Wrap all lazy routes in <Suspense fallback={<PageLoader />}>
```

**Done condition:** Route tree defined. Navigating to `/auth/login` renders `LoginPage` inside `AuthLayout`.

---

### Step 7.2 — Create `src/App.tsx`

```tsx
// On mount (useEffect, runs once):
//   1. Read token from useAuthStore
//   2. If token exists: call getMe() API function
//      - On success: call setAuth(existing_token, user) to populate user in store
//      - On failure (401): call clearAuth()
// Renders the route tree from routes.tsx
```

**Done condition:** App boots, checks for stored token, hydrates auth state, renders routes.

---

### Step 7.3 — Update `src/main.tsx`

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
```

**Done condition:** App boots in browser. No console errors. Route navigation works.

---

## PHASE 8 — Onboarding Feature

### Step 8.1 — Create `src/features/onboarding/onboarding.types.ts`

```typescript
export interface AcademicInfo {
  academic_level: string
  major: string
}

export interface SubjectInput {
  name: string
  level: string
  priority: number
  weekly_hours: number
  target_weeks: number
  goal?: string
}

export interface AvailabilitySlot {
  start: string
  end: string
}
```

**Done condition:** All types exportable.

---

### Step 8.2 — Create `src/features/onboarding/onboarding.api.ts`

```typescript
export const saveAcademic = (data: AcademicInfo): Promise<{ saved: boolean }>
export const saveSubjects = (subjects: SubjectInput[]): Promise<{ subjects_saved: number }>
export const saveHobbies = (hobbies: string[]): Promise<{ hobbies_saved: number }>
export const saveAvailability = (slots: AvailabilitySlot[]): Promise<{ saved: boolean }>
export const completeOnboarding = (): Promise<{ job_id: string; message: string }>
```

All call the appropriate `POST /onboarding/*` endpoints.

**Done condition:** All five functions exported with correct types.

---

### Step 8.3 — Create onboarding step components

Each step component:
- Receives `onNext: () => void` as prop
- Manages its own local form state
- Calls the corresponding API function before calling `onNext()`
- Shows loading state during API call
- Shows error message on failure

**`StepAcademic.tsx`**
Form: `academic_level` (select from `ACADEMIC_LEVELS`), `major` (text input).
Calls `saveAcademic()`, then `onNext()`.

**`StepSubjects.tsx`**
Dynamic list of subjects. "Add Subject" button adds a row. Each row: name, level (select), priority (1-10 number), weekly_hours, target_weeks, goal (optional).
Minimum 1 subject required. Calls `saveSubjects()`, then `onNext()`.

**`StepHobbies.tsx`**
Text input to type a hobby + "Add" button. Shows added hobbies as removable pills.
Calls `saveHobbies()`, then `onNext()`.

**`StepAvailability.tsx`**
Add time slots (start HH:MM, end HH:MM). Shows added slots as removable rows.
Calls `saveAvailability()`, then `onNext()`.

**`StepFinish.tsx`**
Summary screen. "Start Learning" button calls `completeOnboarding()`, stores returned `job_id` in `useUIStore.setOnboardingJobId()`, then navigates to `/app/dashboard`.

**`OnboardingProgress.tsx`**
Progress bar or step indicators showing current step out of 5. Props: `currentStep: number`, `totalSteps: number`.

**Done condition:** All 6 components exist and render without errors.

---

### Step 8.4 — Create `src/features/onboarding/pages/OnboardingPage.tsx`

```tsx
// Manages step counter in local state (useState, starts at 1)
// Renders OnboardingProgress at top
// Renders the current step component based on step counter
// Each step's onNext increments the step counter
// Steps: 1=Academic, 2=Subjects, 3=Hobbies, 4=Availability, 5=Finish
// Full-page layout: centered container, no layout wrapper
// Background: #f8f9fc
```

**Done condition:** Navigating to `/onboarding` renders the step flow. Each "Next" advances to the next step.

---

## PHASE 9 — Dashboard Feature

### Step 9.1 — Create `src/features/dashboard/dashboard.types.ts`

```typescript
export interface DashboardStats {
  current_streak: number
  longest_streak: number
  today_lessons_count: number
  avg_quiz_score: number
  completion_rate: number
}

export interface DashboardState {
  user: { id: string; email: string }
  profile: { full_name: string; academic_level: string; major: string }
  hobbies: string[]
  subjects: SubjectSummary[]
  upcoming_schedule: ScheduleEntry[]
  stats: DashboardStats
  last_active_lesson_id: string | null
}

// SubjectSummary, ScheduleEntry inline types as needed
```

**Done condition:** Types exportable.

---

### Step 9.2 — Create `src/features/dashboard/dashboard.api.ts`

```typescript
export const getDashboardState = (): Promise<DashboardState> =>
  apiClient.get('/state')
```

**Done condition:** Function exportable.

---

### Step 9.3 — Create `src/features/dashboard/dashboard.queries.ts`

```typescript
export const useDashboardStateQuery = () =>
  useQuery({ queryKey: ['dashboard-state'], queryFn: getDashboardState })

export const useJobStatusQuery = (jobId: string | null) =>
  useQuery({
    queryKey: ['job', jobId],
    queryFn: () => apiClient.get(`/jobs/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (data?.status === 'complete' || data?.status === 'failed') return false
      return 5000
    }
  })
```

**Done condition:** Both hooks exportable.

---

### Step 9.4 — Create dashboard components

**`GeneratingBanner.tsx`**
Props: `jobId: string`
- Uses `useJobStatusQuery(jobId)`
- While status is "pending" or "running": renders banner with spinner + "Generating your courses…"
- When status becomes "complete": calls `queryClient.invalidateQueries(['dashboard-state'])` then calls `useUIStore.setOnboardingJobId(null)`
- When status is "failed": renders error message

**`StatsRow.tsx`**
Props: `stats: DashboardStats`
Renders 5 stat cards in a row:
- Current Streak (🔥 icon + number)
- Longest Streak
- Today's Lessons (today_lessons_count)
- Avg Quiz Score (%)
- Completion Rate (%)

Each stat is a `Card` with label above and large number below.

**`SubjectProgressList.tsx`**
Props: `subjects: SubjectSummary[]`
Renders each subject as a row: subject name, `Progress` bar, percentage label.

**`UpcomingLessons.tsx`**
Props: `schedule: ScheduleEntry[]`
Shows upcoming schedule entries (next 3-5). Each entry is a clickable card navigating to `/app/lesson/:related_lesson_id`. Shows time, title, activity type badge.

**`ContinueLearningCard.tsx`**
Props: `lastLessonId: string | null`
If `lastLessonId` present: shows "Continue Learning" card with "Resume" button linking to `/app/lesson/:id`.
If null: shows empty state.

**`QuickActions.tsx`**
Three buttons:
- "Quick Ask" (opens a modal — stub for now, link to `/app/notes`)
- "Quick Quiz" → navigates to `/app/quick-quiz`
- "Browse Subjects" → navigates to `/app/subjects`

**`WelcomeSection.tsx`**
Props: `name: string`
Renders "Good [time of day], [name]!" heading + subtitle.

**Done condition:** All 7 components render without errors with stub/mock data.

---

### Step 9.5 — Create `src/features/dashboard/pages/DashboardPage.tsx`

```tsx
// Uses useDashboardStateQuery()
// Loading state: show PageLoader
// Error state: show error message
// Success state:
//   - If onboardingJobId in uiStore: render <GeneratingBanner jobId={...} />
//   - Render WelcomeSection, StatsRow, SubjectProgressList, UpcomingLessons,
//     ContinueLearningCard, QuickActions in a two-column grid layout:
//     Left column (wider): Welcome + UpcomingLessons + ContinueLearning
//     Right column: Stats + SubjectProgress + QuickActions
```

**Done condition:** Dashboard renders with real data from API.

---

## PHASE 10 — Subjects Feature

### Step 10.1 — Create types, API, and queries

**`subjects.types.ts`**
```typescript
export interface Subject {
  id: string
  name: string
  level: string
  priority: number
  weekly_hours: number
  target_weeks: number
  user_goal?: string
  status: string
  progress_percentage: number
  course_id?: string
  course_generation_status?: string
}
```

**`subjects.api.ts`**
```typescript
export const getSubjects = (): Promise<Subject[]>
export const getSubject = (id: string): Promise<Subject>
export const createSubject = (data: SubjectCreate): Promise<Subject>
export const updateSubject = (id: string, data: SubjectUpdate): Promise<Subject>
export const deleteSubject = (id: string): Promise<void>
```

**`subjects.queries.ts`**
```typescript
export const useSubjectsQuery = () => useQuery({ queryKey: ['subjects'], queryFn: getSubjects })
export const useSubjectQuery = (id: string) => useQuery({ queryKey: ['subject', id], queryFn: () => getSubject(id) })
export const useCreateSubjectMutation = () => useMutation({ mutationFn: createSubject, onSuccess: () => queryClient.invalidateQueries(['subjects']) })
export const useDeleteSubjectMutation = () => useMutation({ mutationFn: deleteSubject, onSuccess: () => queryClient.invalidateQueries(['subjects']) })
```

**Done condition:** All files exportable.

---

### Step 10.2 — Create subject components

**`SubjectCard.tsx`**
Props: `subject: Subject`
Renders a `Card` with:
- Subject name (heading)
- Level badge
- Progress bar with percentage
- Priority indicator
- "Open Course" button → navigates to `/app/course/:course_id` (disabled if no course_id)

**`AddSubjectModal.tsx`**
Opens as a `Modal`. Form fields: name, level (select), priority (number 1-10), weekly_hours, target_weeks, goal (optional textarea).
Submit calls `useCreateSubjectMutation()`. Closes on success.

**Done condition:** Both components render without errors.

---

### Step 10.3 — Create `SubjectsPage.tsx`

```tsx
// Uses useSubjectsQuery()
// Header row: "My Subjects" heading + "Add Subject" button
// Loading: show spinner grid
// Empty: show <EmptyState heading="No subjects yet" action={{ label: "Add Subject", ... }} />
// Data: responsive grid (2-3 columns) of SubjectCard components
// "Add Subject" button opens AddSubjectModal
```

**Done condition:** Page renders subject grid with real data. Adding a subject refreshes the list.

---

## PHASE 11 — Course Feature

### Step 11.1 — Create types, API, and queries

**`course.types.ts`**
```typescript
export interface LessonMeta {
  id: string
  title: string
  lesson_order: number
  generation_status: string
  completed: boolean
}

export interface Module {
  id: string
  title: string
  description?: string
  module_order: number
  is_locked: boolean
  lessons: LessonMeta[]
}

export interface CourseStructure {
  id: string
  title: string
  description?: string
  total_modules: number
  generation_status: string
  modules: Module[]
}
```

**`course.api.ts`**
```typescript
export const getCourseBySubject = (subjectId: string): Promise<CourseStructure>
export const getCourseStructure = (courseId: string): Promise<CourseStructure>
```

**`course.queries.ts`**
```typescript
export const useCourseStructureQuery = (courseId: string) =>
  useQuery({ queryKey: ['course', courseId], queryFn: () => getCourseStructure(courseId) })
```

**Done condition:** All files exportable.

---

### Step 11.2 — Create course components

**`LessonItem.tsx`**
Props: `lesson: LessonMeta`, `onClick: () => void`
Renders a row: lesson title, completed checkmark (if completed), lock icon (if module locked). Clickable.

**`ModuleSection.tsx`**
Props: `module: Module`
Renders module title with expand/collapse. When expanded, shows list of `LessonItem` components.

**`CourseSidebar.tsx`**
Props: `courseId: string`
- Fetches course structure via `useCourseStructureQuery(courseId)`
- Renders list of `ModuleSection` components
- Clicking a lesson navigates to `/app/lesson/:lessonId` and updates `learningStore`
- Shows loading skeleton while fetching

**`CourseGeneratingState.tsx`**
Renders: spinner + "Your course is being generated…" message.
Shown when `course.generation_status !== 'complete'`.

**Done condition:** All four components render without errors.

---

### Step 11.3 — Create `CoursePage.tsx`

```tsx
// Reads courseId from route params (useParams)
// Fetches course via useCourseStructureQuery()
// Shows CourseGeneratingState if not complete
// Shows course title, description, module completion summary
// Note: CourseSidebar is rendered by LearningLayout, NOT this page
```

**Done condition:** Page renders inside LearningLayout with sidebar visible.

---

## PHASE 12 — Lesson Feature

### Step 12.1 — Create types, API, and queries

**`lesson.types.ts`**
```typescript
export interface Lesson {
  id: string
  title: string
  generation_status: string
  content?: string
  summary?: string
  hobby_explanation?: string
  references?: string[]
  youtube_links?: string[]
  completed: boolean
}
```

**`lesson.api.ts`**
```typescript
export const getLesson = (lessonId: string): Promise<Lesson>
export const markLessonComplete = (lessonId: string): Promise<void>
export const getNextLesson = (currentLessonId: string): Promise<Lesson | null>
```

**`lesson.queries.ts`**
```typescript
export const useLessonQuery = (lessonId: string) =>
  useQuery({ queryKey: ['lesson', lessonId], queryFn: () => getLesson(lessonId) })

export const useMarkCompleteMutation = () =>
  useMutation({
    mutationFn: markLessonComplete,
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['course'] })
    }
  })
```

**Done condition:** All files exportable.

---

### Step 12.2 — Create lesson components

**`LessonGeneratingState.tsx`**
Renders a centered container with spinner + "Generating your personalized lesson…" text + subtext "This may take a few seconds."

**`LessonHeader.tsx`**
Props: `title: string`, `completed: boolean`
Renders lesson title heading and completion badge if completed.

**`LessonContent.tsx`**
Props: `lesson: Lesson`
Renders:
- `LessonHeader`
- Theory content (render markdown — use a markdown library or simple pre-wrap for V1)
- Hobby-based explanation section (if present): titled "How it relates to your interests"
- Summary section

**`LessonReferences.tsx`**
Props: `references?: string[]`, `youtubeLinks?: string[]`
Renders reference links (plain anchor tags) and YouTube links in a "Resources" section.

**`MarkCompleteButton.tsx`**
Props: `lessonId: string`, `completed: boolean`
If not completed: renders primary blue "Mark Complete" button that calls `useMarkCompleteMutation()`.
If completed: renders a green "Completed ✓" badge (not a button).

**Done condition:** All five components render without errors.

---

### Step 12.3 — Create `LessonPage.tsx`

```tsx
// Reads lessonId from useParams()
// On mount: updates learningStore.setActiveLesson(courseId, lessonId)
//   - courseId comes from learningStore.activeCourseId (set by LearningLayout)
// Uses useLessonQuery(lessonId)
// Loading state: <LessonGeneratingState />  (lesson generation takes 5-15s)
// Error state: error message + retry button
// Success state (generation_status === 'generating'): <LessonGeneratingState />
// Success state (generation_status === 'complete'):
//   <LessonContent /> + <LessonReferences /> + <MarkCompleteButton />
```

**Done condition:** Lesson page renders all states correctly.

---

## PHASE 13 — Tutor Panel Feature

### Step 13.1 — Create types and API

**`tutor.types.ts`**
```typescript
export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TutorChatResponse {
  session_id: string
  response: string
  references: any[]
}
```

**`tutor.api.ts`**
```typescript
export const tutorChat = (
  message: string,
  lessonId: string,
  sessionId?: string
): Promise<TutorChatResponse> =>
  apiClient.post('/ai/tutor/chat', { message, lesson_id: lessonId, session_id: sessionId })

export const quickAsk = (
  message: string,
  subjectId?: string
): Promise<{ response: string; references: any[] }> =>
  apiClient.post('/ai/quick-ask', { message, subject_id: subjectId })
```

**Done condition:** Both functions exportable.

---

### Step 13.2 — Create tutor components

**`TutorMessageBubble.tsx`**
Props: `message: TutorMessage`
User messages: right-aligned blue bubble.
Assistant messages: left-aligned light gray bubble. Renders text content.

**`TutorMessageList.tsx`**
Props: `messages: TutorMessage[]`, `isLoading: boolean`
Renders list of `TutorMessageBubble` components. Auto-scrolls to bottom on new message.
When `isLoading` is true: renders a "typing" indicator bubble (three animated dots).

**`TutorInput.tsx`**
Props: `onSend: (message: string) => void`, `disabled: boolean`
Text input with send button. On Enter or button click: calls `onSend(message)` and clears input.
Disabled when `disabled` is true (during API call).

**`TutorPanel.tsx`**
The main right panel component:
- Manages local state: `messages: TutorMessage[]`, `isLoading: boolean`
- Reads `activeLessonId` and `tutorSessionId` from `learningStore`
- On `activeLessonId` change: clears messages
- `handleSend(text)`:
  1. Appends `{ role: 'user', content: text }` to messages immediately
  2. Sets `isLoading = true`
  3. Calls `tutorChat(text, activeLessonId, tutorSessionId)`
  4. On response: calls `initTutorSession(response.session_id)`, appends assistant message
  5. Sets `isLoading = false`
- Renders: panel header "AI Tutor", `TutorMessageList`, `TutorInput`
- Shows "Open a lesson to start chatting" placeholder when no `activeLessonId`

**Done condition:** TutorPanel renders inside LearningLayout. Sending a message shows user bubble immediately and assistant response after API call.

---

## PHASE 14 — Quiz Feature

### Step 14.1 — Create types, API, and store

**`quiz.types.ts`**
```typescript
export interface QuizQuestion {
  id: string
  question_text: string
  question_type: 'mcq' | 'truefalse' | 'subjective'
  options?: string[]
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

export interface QuizResult {
  quiz_id: string
  score: number
  passed: boolean
  feedback?: string
  question_results: Array<{ question_id: string; correct: boolean; feedback?: string }>
}
```

**`quiz.api.ts`**
```typescript
export const generateModuleQuiz = (moduleId: string, difficulty: string, count: number): Promise<Quiz>
export const generateQuickQuiz = (subjectId: string, difficulty: string, count: number): Promise<Quiz>
export const submitQuiz = (quizId: string, answers: Array<{question_id: string, answer: string}>): Promise<QuizResult>
export const getQuizHistory = (): Promise<any[]>
```

**`quiz.queries.ts`**
```typescript
export const useGenerateModuleQuizMutation = () => useMutation({ mutationFn: ... })
export const useGenerateQuickQuizMutation = () => useMutation({ mutationFn: ... })
export const useSubmitQuizMutation = () => useMutation({ mutationFn: ... })
```

**`quiz.store.ts`**
```typescript
interface QuizState {
  questions: QuizQuestion[]
  answers: Record<string, string>
  submitted: boolean
  result: QuizResult | null
  setQuestions: (questions: QuizQuestion[]) => void
  setAnswer: (questionId: string, answer: string) => void
  setResult: (result: QuizResult) => void
  reset: () => void
}
```

**Done condition:** All files exportable.

---

### Step 14.2 — Create quiz components

**`MCQOption.tsx`**
Props: `option: string`, `selected: boolean`, `correct?: boolean`, `onClick: () => void`
Renders a selectable option pill. Highlights when selected. Shows green/red after submission.

**`SubjectiveInput.tsx`**
Props: `value: string`, `onChange: (v: string) => void`, `disabled: boolean`
A textarea for open-ended answers.

**`QuizQuestion.tsx`**
Props: `question: QuizQuestion`, `answer: string`, `onAnswer: (a: string) => void`, `submitted: boolean`, `result?: object`
Renders question text. For MCQ: renders `MCQOption` list. For True/False: two `MCQOption` buttons. For subjective: `SubjectiveInput`.

**`QuizResults.tsx`**
Props: `result: QuizResult`
Shows: score percentage (large), passed/failed badge, per-question feedback list, "Try Again" button (calls `quiz.store.reset()`).

**Done condition:** All four components render without errors.

---

### Step 14.3 — Create quiz pages

**`ModuleQuizPage.tsx`**
Flow:
1. On mount: generates quiz via `useGenerateModuleQuizMutation` using `quizId` from route params
2. Loading: spinner + "Generating quiz…"
3. Quiz active: renders `QuizQuestion` for each question, paginated or scrollable
4. Submit button: disabled until all questions answered, calls `useSubmitQuizMutation`
5. Submitted: renders `QuizResults`

**`QuickQuizPage.tsx`**
Flow:
1. Step 1: Select subject (dropdown), select difficulty (easy/medium/hard)
2. "Start Quiz" button: calls `generateQuickQuiz`
3. Same quiz flow as ModuleQuizPage once questions are loaded

**Done condition:** Both pages render and flow through states correctly.

---

## PHASE 15 — Schedule Feature

### Step 15.1 — Create types, API, and queries

**`schedule.types.ts`**
```typescript
export interface ScheduleEntry {
  id: string
  title: string
  start_time: string
  end_time: string
  activity_type: string
  status: string
  related_subject_id?: string
  related_lesson_id?: string
  related_quiz_id?: string
}
```

**`schedule.api.ts`**
```typescript
export const getSchedule = (): Promise<{ entries: ScheduleEntry[] }>
export const updateEntryStatus = (entryId: string, status: string): Promise<void>
export const regenerateSchedule = (feedback: string): Promise<void>
```

**`schedule.queries.ts`**
```typescript
export const useScheduleQuery = () => useQuery({ queryKey: ['schedule'], queryFn: getSchedule })
export const useUpdateStatusMutation = () => useMutation({ mutationFn: ..., onSuccess: () => queryClient.invalidateQueries(['schedule']) })
export const useRegenerateScheduleMutation = () => useMutation({ mutationFn: regenerateSchedule, onSuccess: () => queryClient.invalidateQueries(['schedule']) })
```

**Done condition:** All files exportable.

---

### Step 15.2 — Create schedule components

**`ScheduleEntry.tsx`**
Props: `entry: ScheduleEntry`
Renders a time block card: time range, title, activity type badge (colored), status badge.
For study entries: entire card is clickable → navigates to `/app/lesson/:related_lesson_id`.

**`DayColumn.tsx`**
Props: `day: string`, `entries: ScheduleEntry[]`
Renders a column with day heading and list of `ScheduleEntry` cards.

**`WeekView.tsx`**
Props: `entries: ScheduleEntry[]`
Groups entries by day of week. Renders 7 `DayColumn` components in a horizontal scroll if needed.

**`RegenerateScheduleModal.tsx`**
A `Modal` with a textarea ("What should we change?") and a "Regenerate" button.
On submit: calls `useRegenerateScheduleMutation(feedback)`. Shows loading state during regeneration. Closes on success.

**Done condition:** All four components render without errors.

---

### Step 15.3 — Create `SchedulePage.tsx`

```tsx
// Uses useScheduleQuery()
// Header: "My Schedule" heading + "Regenerate" button
// Loading: spinner
// Empty: EmptyState
// Data: renders <WeekView entries={...} />
// "Regenerate" button opens <RegenerateScheduleModal />
```

**Done condition:** Page renders weekly view with real schedule data.

---

## PHASE 16 — Notes Feature

### Step 16.1 — Create types, API, and queries

**`notes.types.ts`**
```typescript
export interface NoteListItem {
  id: string
  title: string
  description?: string
  subject_id?: string
  subject_name?: string
  created_at: string
}

export interface Note extends NoteListItem {
  content: string
}
```

**`notes.api.ts`**
```typescript
export const getNotes = (subjectId?: string): Promise<{ notes: NoteListItem[] }>
export const getNote = (noteId: string): Promise<Note>
export const createNote = (data: { title: string; content: string; description?: string; subject_id?: string }): Promise<{ id: string; title: string; created_at: string }>
export const updateNote = (noteId: string, data: Partial<Note>): Promise<void>
export const deleteNote = (noteId: string): Promise<void>
```

**`notes.queries.ts`**
All 5 CRUD hooks using `useMutation` and `useQuery`. Invalidate `['notes']` on create/update/delete.

**Done condition:** All files exportable.

---

### Step 16.2 — Create notes components

**`NoteCard.tsx`**
Props: `note: NoteListItem`, `selected: boolean`, `onClick: () => void`
Shows: title, description (truncated), subject name, date. Highlighted border when selected.

**`NoteList.tsx`**
Props: `notes: NoteListItem[]`, `selectedId?: string`, `onSelect: (id: string) => void`
Vertical list of `NoteCard` components.

**`NoteEditor.tsx`**
Props: `note?: Note`, `onSave: (data) => void`
Fields: title (input), subject (optional select from subjects), content (textarea).
Auto-saves on blur: calls `onSave`. Shows "Saved" / "Saving…" status indicator.
If `note` is undefined: new note mode (blank fields).

**Done condition:** All three components render without errors.

---

### Step 16.3 — Create `NotesPage.tsx`

```tsx
// Two-column layout: NoteList (left, ~300px) + NoteEditor (right, flex-1)
// State: selectedNoteId (string | null)
// "New Note" button: sets selectedNoteId to null, clears editor
// On NoteList select: sets selectedNoteId, fetches full note, loads in editor
// Editor onSave:
//   - If new note: calls createNote mutation, then sets selectedNoteId to new id
//   - If existing: calls updateNote mutation
// Uses useNotesQuery() for list, useNoteQuery(selectedNoteId) for full note
```

**Done condition:** Page renders two-column layout. Creating and editing notes works.

---

## PHASE 17 — Insights Feature

### Step 17.1 — Create types, API, and queries

**`insights.types.ts`**
```typescript
export interface SubjectProgress { subject_id: string; subject_name: string; progress_percentage: number }
export interface DashboardInsights {
  current_streak: number
  longest_streak: number
  today_lessons_completed: number
  today_lessons_total: number
  total_study_hours: number
  avg_quiz_score: number
  quiz_completion_rate: number
  subject_progress: SubjectProgress[]
  weekly_study_hours: Array<{ date: string; hours: number }>
}
export interface AIInsights {
  insights: string[]
  generated_at: string
}
```

**`insights.api.ts`**
```typescript
export const getDashboardInsights = (): Promise<DashboardInsights>
export const getAIReport = (): Promise<AIInsights>
```

**`insights.queries.ts`**
```typescript
export const useDashboardInsightsQuery = () => useQuery({ queryKey: ['insights'], queryFn: getDashboardInsights })
export const useAIReportQuery = () => useQuery({ queryKey: ['ai-report'], queryFn: getAIReport, staleTime: 10 * 60 * 1000 })
```

**Done condition:** All files exportable.

---

### Step 17.2 — Create insights components

**`StreakDisplay.tsx`**
Props: `current: number`, `longest: number`
Renders: flame icon + current streak number, longest streak below. Card format.

**`ProgressChart.tsx`**
Props: `weeklyData: Array<{date: string, hours: number}>`
Renders a simple line or bar chart. Use plain HTML/CSS bar chart for V1 (no chart library required — simple flex bars work). Each bar proportional to hours value.

**`QuizScoreChart.tsx`**
Props: `subjectProgress: SubjectProgress[]`
Renders a bar per subject showing progress percentage. Simple flex-based horizontal bars.

**`AIFeedbackCard.tsx`**
Props: `insights: string[] | undefined`, `isLoading: boolean`
Loading: renders skeleton (3 gray animated lines).
Loaded: renders each insight as a bullet point inside a `Card`.

**Done condition:** All four components render without errors.

---

### Step 17.3 — Create `InsightsPage.tsx`

```tsx
// Two sections:
// Section 1: Stats (uses useDashboardInsightsQuery)
//   - StreakDisplay, ProgressChart, QuizScoreChart
// Section 2: AI Report (uses useAIReportQuery)
//   - AIFeedbackCard with loading state
// Layout: vertical stack, cards grouped by section
```

**Done condition:** Page renders both sections with real data.

---

## PHASE 18 — Profile Feature

### Step 18.1 — Create types, API, and queries

**`profile.types.ts`**
```typescript
export interface Profile {
  user: { id: string; email: string }
  profile: { full_name: string; academic_level: string; major: string; available_time_slots: Array<{start: string, end: string}> }
  hobbies: string[]
  subjects: SubjectProfileItem[]
}
```

**`profile.api.ts`**
```typescript
export const getProfile = (): Promise<Profile>
export const updateProfile = (data: Partial<{
  full_name: string;
  available_time_slots: Array<{start: string, end: string}>;
  hobbies: string[];
  subjects: Array<{id: string; priority?: number; weekly_hours?: number; goal?: string}>;
}>): Promise<void>
```

**`profile.queries.ts`**
```typescript
export const useProfileQuery = () => useQuery({ queryKey: ['profile'], queryFn: getProfile })
export const useUpdateProfileMutation = () => useMutation({ mutationFn: updateProfile, onSuccess: () => queryClient.invalidateQueries(['profile']) })
```

**Done condition:** All files exportable.

---

### Step 18.2 — Create profile section components

Each section manages its own `editing: boolean` state. Shows view mode by default; clicking "Edit" switches to edit mode with a form; clicking "Save" calls `useUpdateProfileMutation`.

**`AccountSection.tsx`**
Shows: full_name (editable), email (read-only), academic_level (editable), major (editable).

**`HobbiesSection.tsx`**
Shows list of hobbies as pills. Edit mode: add/remove hobby pills.

**`SubjectsSection.tsx`**
Shows table of subjects with priority, weekly_hours, goal. Edit mode: inline editable fields.

**`PreferencesSection.tsx`**
Shows available_time_slots list. Edit mode: add/remove time slots (same UI as onboarding availability step).

**Done condition:** All four section components render in view mode without errors.

---

### Step 18.3 — Create `ProfilePage.tsx`

```tsx
// Uses useProfileQuery()
// Renders four section components stacked vertically
// Each section is wrapped in a Card
// Page heading: "Profile & Settings"
```

**Done condition:** Page renders all four sections with real profile data.

---

## PHASE 19 — Landing Page (Stub)

### Step 19.1 — Create landing page

Create `src/features/landing/pages/LandingPage.tsx` (also create the directory):

```tsx
// Simple marketing page inside AuthLayout:
// - Large heading: "EveAI — Your Personalized Learning OS"
// - Subtitle: "AI-powered courses tailored to how you think, built around what you love."
// - Two buttons: "Get Started" → /auth/register, "Login" → /auth/login
// - Three feature bullets below buttons
// No complex animations. Clean card layout centered on page.
```

Register this route in `routes.tsx` as the `/` route.

**Done condition:** Visiting `/` renders the landing page with working buttons.

---

## PHASE 20 — End-to-End Verification

Run each check in sequence. All must pass before declaring the frontend complete.

### Check 20.1 — Boot sequence
```
1. Open app in browser (http://localhost:5173)
2. "/" → LandingPage renders
3. Click "Get Started" → RegisterPage renders with form
4. Register → redirected to /onboarding
5. Complete onboarding steps 1-5 → redirected to /app/dashboard
6. Dashboard shows GeneratingBanner
7. After polling completes → banner disappears, subjects and schedule appear
```

### Check 20.2 — Auth persistence
```
1. Login, then refresh the page
2. App should remain on the dashboard (not redirected to login)
3. Token is read from localStorage and auth state is hydrated
```

### Check 20.3 — Route protection
```
1. Clear localStorage
2. Navigate to /app/dashboard
3. Should be redirected to /auth/login
```

### Check 20.4 — Onboarding guard
```
1. Register a new user (onboarding_complete = false)
2. Navigate to /app/dashboard
3. Should be redirected to /onboarding
```

### Check 20.5 — Learning flow
```
1. Navigate to /app/subjects
2. Click "Open Course" on a subject
3. LearningLayout renders: sidebar visible, center panel shows CoursePage
4. Click a lesson in the sidebar
5. LessonPage loads (shows generating state if first time)
6. TutorPanel is visible on the right
7. Send a message to tutor → response appears
8. Click "Mark Complete" → button changes to completed badge
```

### Check 20.6 — Notes flow
```
1. Navigate to /app/notes
2. Click "New Note" → blank editor appears
3. Type title and content
4. Click away from field → "Saved" indicator appears
5. Note appears in left list
6. Click note in list → note loads in editor
```

### Check 20.7 — Error handling
```
1. Stop the backend server
2. Try to navigate to /app/dashboard
3. Should show an error state, not a blank screen or unhandled crash
```

---

## IMPLEMENTATION COMPLETE

At this point the full EveAI frontend is implemented. All routes are functional, all API integrations are connected, all state management is in place, and the end-to-end flows are verified.