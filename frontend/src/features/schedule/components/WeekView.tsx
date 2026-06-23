import DayColumn from './DayColumn'
import type { ScheduleEntry as SE } from '../schedule.types'

function groupByDay(entries: SE[]) {
  const days: Record<string, SE[]> = {}
  entries.forEach((e) => {
    const d = new Date(e.start_time).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    if (!days[d]) days[d] = []
    days[d].push(e)
  })
  return days
}

export default function WeekView({ entries }: { entries: SE[] }) {
  const grouped = groupByDay(entries)
  const dayKeys = Object.keys(grouped)
  return (
    <div className="flex gap-4 overflow-x-auto py-4">
      {dayKeys.map((d) => (
        <DayColumn key={d} day={d} entries={grouped[d]} />
      ))}
    </div>
  )
}
