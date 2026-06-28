import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLoader } from '@/components/shared/PageLoader'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'))
const AboutPage = lazy(() => import('@/features/landing/pages/AboutPage'))
const ContactPage = lazy(() => import('@/features/landing/pages/ContactPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const SubjectsPage = lazy(() => import('@/features/subjects/pages/SubjectsPage'))
const SchedulePage = lazy(() => import('@/features/schedule/pages/SchedulePage'))
const NotesPage = lazy(() => import('@/features/notes/pages/NotesPage'))
const InsightsPage = lazy(() => import('@/features/insights/pages/InsightsPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const CoursePage = lazy(() => import('@/features/course/pages/CoursePage'))
const LessonPage = lazy(() => import('@/features/lesson/pages/LessonPage'))
const ModuleQuizPage = lazy(() => import('@/features/quiz/pages/ModuleQuizPage'))
const QuickQuizPage = lazy(() => import('@/features/quiz/pages/QuickQuizPage'))
const QuickQuizTakePage = lazy(() => import('@/features/quiz/pages/TakeQuizPage'))
const QuickAskPage = lazy(() => import('@/features/tutor/pages/QuickAskPage'))

const AuthLayout = lazy(() => import('@/app/layouts/AuthLayout'))
const AppLayout = lazy(() => import('@/app/layouts/AppLayout'))
const LearningLayout = lazy(() => import('@/app/layouts/LearningLayout'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>

        <Route path="/onboarding" element={<OnboardingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app/dashboard" element={<DashboardPage />} />
            <Route path="/app/subjects" element={<SubjectsPage />} />
            <Route path="/app/schedule" element={<SchedulePage />} />
            <Route path="/app/notes" element={<NotesPage />} />
            <Route path="/app/quick-ask" element={<QuickAskPage />} />
            <Route path="/app/insights" element={<InsightsPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/quiz/:quizId" element={<ModuleQuizPage />} />
            <Route path="/app/quick-quiz" element={<QuickQuizPage />} />
            <Route path="/app/quick-quiz/take/:quizId" element={<QuickQuizTakePage />} />
          </Route>
          <Route element={<LearningLayout />}>
            <Route path="/app/course/:courseId" element={<CoursePage />} />
            <Route path="/app/lesson/:lessonId" element={<LessonPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
