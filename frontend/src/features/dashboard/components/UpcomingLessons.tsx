import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { ScheduleEntry } from '../dashboard.types'

interface UpcomingLessonsProps {
  schedule: ScheduleEntry[]
}

export function UpcomingLessons({ schedule }: UpcomingLessonsProps) {
  return (
    <Card className="p-5">
      <div className="mb-5 text-sm font-medium text-[#475569]">Upcoming lessons</div>
      <div className="space-y-3">
        {schedule.slice(0, 5).map((item) =>
          item.related_lesson_id ? (
            <Link
              key={item.id}
              to={`/app/lesson/${item.related_lesson_id}`}
              className="block rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-4 hover:border-[#607afb]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">{item.title}</div>
                  <div className="text-xs text-[#64748b]">{item.time}</div>
                </div>
                <Badge>{item.activity_type}</Badge>
              </div>
            </Link>
          ) : (
            <div
              key={item.id}
              className="block rounded-3xl border border-[#e9eaf2] bg-gray-100 p-4 text-[#64748b]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#0f172a]">{item.title}</div>
                  <div className="text-xs text-[#64748b]">{item.time}</div>
                  <div className="mt-1 text-xs text-[#94a3b8]">Lesson link unavailable</div>
                </div>
                <Badge>{item.activity_type}</Badge>
              </div>
            </div>
          ),
        )}
      </div>
    </Card>
  )
}
