import { Card } from '@/components/ui/Card'
import type { DashboardStats } from '../dashboard.types'

interface StatsRowProps {
  stats: DashboardStats
}

export function StatsRow({ stats }: StatsRowProps) {
  const items = [
    { label: 'Total Study Hours', value: '[84h]', detail: '[+6h this week]' },
    { label: 'Lessons Completed', value: '[47]', detail: '[of 96 total]' },
    { label: 'Current Streak', value: `${stats.current_streak}d`, detail: '[Best: 18 days]' },
    { label: 'This Week', value: '[6h]', detail: '[Goal: 10h]' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

