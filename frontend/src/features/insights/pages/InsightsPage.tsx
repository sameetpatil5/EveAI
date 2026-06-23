import { useDashboardInsightsQuery, useAIReportQuery } from '../insights.queries'
import StreakDisplay from '../components/StreakDisplay'
import ProgressChart from '../components/ProgressChart'
import QuizScoreChart from '../components/QuizScoreChart'
import AIFeedbackCard from '../components/AIFeedbackCard'

export default function InsightsPage() {
  const insightsQ = useDashboardInsightsQuery()
  const reportQ = useAIReportQuery()

  if (insightsQ.isLoading) {
    return <div className="p-6">Loading insights…</div>
  }

  const data = insightsQ.data

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <StreakDisplay current={data?.current_streak ?? 0} longest={data?.longest_streak ?? 0} />
        <div className="lg:col-span-2 grid gap-6">
          <ProgressChart weeklyData={data?.weekly_study_hours ?? []} />
          <QuizScoreChart subjectProgress={data?.subject_progress ?? []} />
        </div>
      </div>
      <AIFeedbackCard insights={reportQ.data?.insights} isLoading={reportQ.isLoading} />
    </div>
  )
}
