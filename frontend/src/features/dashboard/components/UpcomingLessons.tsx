import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import type { ScheduleEntry } from '../dashboard.types'

interface UpcomingLessonsProps {
  schedule: ScheduleEntry[]
  className?: string
}

const dotColors = ['#607afb', '#10b981', '#f59e0b']

export function UpcomingLessons({ schedule, className }: UpcomingLessonsProps) {
  const navigate = useNavigate()
  const displaySchedule = schedule ?? []

  return (
    <Card className={`rounded-3xl p-6 flex flex-col ${className ?? ''}`}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Upcoming Lessons</div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
        {displaySchedule.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No upcoming lessons scheduled yet.
          </div>
        ) : (
          displaySchedule.map((item, index) => {
            const color = dotColors[index % dotColors.length]
            const label = item.activity_type || 'Lesson'
            const time = item.time || 'TBD'
            const duration = item.related_lesson_id ? '45 min' : 'TBD'

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] p-2"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <div>
                    <div className="text-sm font-semibold text-[#0f172a]">{item.title}</div>
                    <div className="text-xs text-[#64748b]">{label} · {time} · {duration}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => item.related_lesson_id && navigate(`/app/lesson/${item.related_lesson_id}`)}
                  disabled={!item.related_lesson_id}
                  className="rounded-md bg-[#607afb] px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-[#4f63df] disabled:cursor-not-allowed disabled:bg-[#cbd5e1]"
                >
                  Start
                </button>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
