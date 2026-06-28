import { useInsightsQuery, useAIReportQuery } from '../insights.queries'
import { InsightsStatsRow } from '../components/InsightsStatsRow'
import ProgressChart from '../components/ProgressChart'
import QuizScoreChart from '../components/QuizScoreChart'
import AIFeedbackCard from '../components/AIFeedbackCard'

export default function InsightsPage() {
  const insightsQ = useInsightsQuery()
  const reportQ = useAIReportQuery()

  if (insightsQ.isLoading) {
    return <div className="p-6">Loading insights…</div>
  }

  const data = insightsQ.data

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-0">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 pb-2">
        <div className="flex flex-1 min-h-0 flex-col gap-4 pt-2">
          <InsightsStatsRow data={data} />

          {/* Middle Section and AI Report - With scroll */}
          <div className="flex-1 min-h-0">
            <div className="flex h-full flex-col gap-4 xl:grid xl:grid-cols-[1fr_2fr] xl:auto-rows-fr">
              {/* Left Column - 1/3 Width */}
              <div className="flex min-h-0 flex-col gap-4 xl:grid xl:grid-rows-2">
                {/* Subject Progress */}
                <div className="min-h-0">
                  <QuizScoreChart subjectProgress={data?.subject_progress ?? []} />
                </div>

                {/* Weekly Study Hours */}
                <div className="min-h-0">
                  <ProgressChart />
                </div>
              </div>

              {/* Right Column - 2/3 Width */}
              {/* AI Report */}
              <AIFeedbackCard insights={reportQ.data?.insights} isLoading={reportQ.isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
