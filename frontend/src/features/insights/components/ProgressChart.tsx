import { Card } from '@/components/ui/Card'
import type { Insights } from '../insights.types'

interface ProgressChartProps {
  data: Insights | undefined
}

const barColors = ['#dbeafe', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca']

export default function ProgressChart({ data }: ProgressChartProps) {
  const weekly = data?.weekly_study_hours ?? []
  const maxHours = Math.max(...weekly.map((item) => item.hours), 2)

  return (
    <Card className="rounded-3xl p-6 flex flex-col h-full">
      <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">
        Weekly Study Hours
      </div>
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-[#0f172a]">
        <div>
          <div className="font-semibold">{data?.total_study_hours_this_week ?? 0}h</div>
          <div className="text-xs text-[#64748b]">Completed this week</div>
        </div>
        <div>
          <div className="font-semibold">{data?.total_study_hours_available_this_week ?? 0}h</div>
          <div className="text-xs text-[#64748b]">Available this week</div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pr-2">
      <div className="space-y-3">
        {weekly.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No weekly study data yet.
          </div>
        ) : (
          weekly.map((item, idx) => {
            const hours = Math.round(item.hours)
            const width = maxHours > 0 ? Math.max((hours / maxHours) * 100, 10) : 10
            return (
              <div key={item.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-[#0f172a]">
                  <span>{item.date}</span>
                  <span>{hours}h</span>
                </div>
                <div className="h-2 rounded-full bg-[#e2e8f0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${width}%`, background: barColors[idx % barColors.length] }}
                  />
                </div>
              </div>
            )
          })
        )}
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-[#f8fafc] text-center text-sm text-[#475569]">
        Estimated target: {data?.total_estimated_study_hours ?? 0}h total across subjects.
      </div>
    </Card>
  )
}
