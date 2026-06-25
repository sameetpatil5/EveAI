import type { Insights } from '../insights.types'

export default function ProgressChart({ weeklyData }: { weeklyData: Insights['weekly_study_hours'] }) {
  const maxHours = Math.max(...weeklyData.map((item: { date: string; hours: number }) => item.hours), 1)
  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
      <div className="mb-4 text-sm font-medium text-[#0f172a]">Weekly study hours</div>
      <div className="space-y-3">
        {weeklyData.map((item: { date: string; hours: number }) => (
          <div key={item.date} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span>{new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              <span>{item.hours}h</span>
            </div>
            <div className="h-3 rounded-full bg-[#e2e8f0]">
              <div className="h-3 rounded-full bg-[#607afb]" style={{ width: `${(item.hours / maxHours) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
