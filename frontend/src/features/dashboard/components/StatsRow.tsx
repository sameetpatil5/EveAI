import { Card } from '@/components/ui/Card'
import type { DashboardStats } from '../dashboard.types'

interface StatsRowProps {
  stats: DashboardStats
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    { label: 'Current Streak', value: stats.current_streak, detail: 'days' },
    { label: 'Longest Streak', value: stats.longest_streak, detail: 'days' },
    { label: "Today's Lessons", value: stats.today_lessons_count, detail: 'lessons' },
    { label: 'Avg Quiz Score', value: `${stats.avg_quiz_score}%`, detail: '' },
    { label: 'Completion Rate', value: `${stats.completion_rate}%`, detail: '' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <div className="text-sm font-medium text-[#64748b]">{item.label}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#0f172a]">{item.value}</span>
            {item.detail ? <span className="text-sm text-[#64748b]">{item.detail}</span> : null}
          </div>
        </Card>
      ))}
    </div>
  )
}
