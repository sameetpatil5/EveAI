import { useUIStore } from '@/stores/ui.store'
import { PageLoader } from '@/components/shared/PageLoader'
import { useDashboardStateQuery } from '../dashboard.queries'
import { GeneratingBanner } from '../components/GeneratingBanner'
import { WelcomeSection } from '../components/WelcomeSection'
import { StatsRow } from '../components/StatsRow'
import { SubjectProgressList } from '../components/SubjectProgressList'
import { UpcomingLessons } from '../components/UpcomingLessons'
import { ContinueLearningCard } from '../components/ContinueLearningCard'
import { QuickActions } from '../components/QuickActions'

export default function DashboardPage() {
  const onboardingJobId = useUIStore((state) => state.onboardingJobId)
  const { data, status, error } = useDashboardStateQuery()

  if (status === 'pending') {
    return <PageLoader />
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-[#e9eaf2] bg-white p-8 text-sm text-[#991b1b] shadow-sm">
          Unable to load dashboard: {error?.message ?? 'Please try again later.'}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-6">
        {onboardingJobId ? <GeneratingBanner jobId={onboardingJobId} /> : null}

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <WelcomeSection name={data.profile.full_name} />
            <UpcomingLessons schedule={data.upcoming_schedule} />
            <ContinueLearningCard lastLessonId={data.last_active_lesson_id} />
          </div>
          <div className="space-y-6">
            <StatsRow stats={data.stats} />
            <SubjectProgressList subjects={data.subjects} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}
