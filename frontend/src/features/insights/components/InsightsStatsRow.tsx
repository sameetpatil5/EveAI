import { Card } from '@/components/ui/Card'
import type { Insights } from '../insights.types'

interface InsightsStatsRowProps {
  data: Insights | undefined
}

export function InsightsStatsRow({ data }: InsightsStatsRowProps) {
  const items = [
    {
      label: 'Total Study Hours',
      value: data?.total_study_hours ? `${data.total_study_hours}h` : '[84h]',
      detail: '[+6h this week]',
    },
    {
      label: 'Lessons Completed',
      value: data?.today_lessons_completed ?? '[47]',
      detail: `[of ${data?.today_lessons_total ?? 96} total]`,
    },
    {
      label: 'Current Streak',
      value: `${data?.current_streak ?? 0}d`,
      detail: `[Best: ${data?.longest_streak ?? 0} days]`,
    },
    {
      label: 'This Week',
      value: '[6h]',
      detail: '[Goal: 10h]',
    },
    {
      label: 'Quiz Avg',
      value: `${data?.avg_quiz_score ?? '[100]'}%`,
      detail: `[${data?.quiz_completion_rate ?? 100}% complete]`,
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
