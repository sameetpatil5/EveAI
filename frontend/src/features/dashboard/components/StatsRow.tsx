import { Card } from '@/components/ui/Card'
import type { DashboardStats } from '../dashboard.types'

interface StatsRowProps {
  stats: DashboardStats
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    {
      label: 'Today Lessons',
      value: `${stats.today_lessons_count}`,
      detail: 'Completed today',
    },
    {
      label: 'Average Quiz',
      value: `${stats.avg_quiz_score}%`,
      detail: 'Average quiz score',
    },
    {
      label: 'Current Streak',
      value: `${stats.current_streak}d`,
      detail: 'Days in a row',
    },
    {
      label: 'Completion Rate',
      value: `${stats.completion_rate}%`,
      detail: 'Lessons completed',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="rounded-3xl p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">{item.label}</div>
          <div className="mt-2 space-y-1">
            <div className="text-2xl font-semibold text-[#0f172a]">{item.value}</div>
            <div className="text-xs text-[#64748b]">{item.detail}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}

