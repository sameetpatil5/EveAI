import { Card } from '@/components/ui/Card'
import type { Insights } from '../insights.types'

interface InsightsStatsRowProps {
  data: Insights | undefined
}

export function InsightsStatsRow({ data }: InsightsStatsRowProps) {
  const items = [
    {
      label: 'Total Study Hours',
      value: `${data?.total_study_hours ?? 0}h`,
      detail: `of ${data?.total_estimated_study_hours ?? 0}h planned`,
    },
    {
      label: 'Lessons Completed',
      value: `${data?.total_lessons_completed ?? 0}`,
      detail: `of ${data?.total_lessons_available ?? 0} total`,
    },
    {
      label: 'Course Completion',
      value: `${data?.total_course_completion ?? 0}%`,
      detail: `Study target: ${data?.total_study_hours_available_this_week ?? 0}h/week`,
    },
    {
      label: 'Current Streak',
      value: `${data?.current_streak ?? 0}d`,
      detail: `Best: ${data?.longest_streak ?? 0} days`,
    },
    {
      label: 'Quiz Avg',
      value: `${data?.avg_quiz_score ?? 0}%`,
      detail: `${data?.quiz_completion_rate ?? 0}% attempted`,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="rounded-3xl p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">{item.label}</div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-[#0f172a]">{item.value}</div>
            <div className="mt-1 text-xs text-[#64748b]">{item.detail}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
