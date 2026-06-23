import { useNavigate } from 'react-router-dom'
import type { ScheduleEntry as SE } from '../schedule.types'
import { Badge } from '@/components/ui/Badge'

export default function ScheduleEntry({ entry }: { entry: SE }) {
  const navigate = useNavigate()
  const timeRange = `${new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(entry.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

  const handleClick = () => {
    if (entry.related_lesson_id) {
      navigate(`/app/lesson/${entry.related_lesson_id}`)
    }
  }

  const badgeClass = entry.status === 'completed' ? 'success' : entry.status === 'missed' ? 'error' : 'default'

  return (
    <div className="mb-3 rounded-lg border border-[#e9eaf2] bg-white p-3 shadow-sm hover:shadow-md cursor-pointer" onClick={handleClick}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[#0f172a]">{entry.title}</div>
          <div className="text-xs text-[#64748b]">{timeRange}</div>
        </div>
        <div className="text-right">
          <Badge variant={badgeClass as any}>{entry.status}</Badge>
        </div>
      </div>
    </div>
  )
}
