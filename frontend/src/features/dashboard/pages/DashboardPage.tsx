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
      <div className="flex h-full min-h-0 items-center justify-center px-4 py-12">
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-0">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-2">
        {onboardingJobId ? <GeneratingBanner jobId={onboardingJobId} /> : null}

        <div className="space-y-4 py-2">
          <WelcomeSection name={data.profile.full_name} stats={data.stats} />
          <StatsRow stats={data.stats} />
        </div>

        <div className="flex-1 min-h-0">
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr] h-full">
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <UpcomingLessons schedule={data.upcoming_schedule} className="flex-1 min-h-0" />
              <ContinueLearningCard lastLessonId={data.last_active_lesson_id} className="h-28" />
            </div>
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <SubjectProgressList subjects={data.subjects} className="flex-1 min-h-0" />
              <QuickActions className="h-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
