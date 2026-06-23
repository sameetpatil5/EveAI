import ScheduleEntry from './ScheduleEntry'
import type { ScheduleEntry as SE } from '../schedule.types'

export default function DayColumn({ day, entries }: { day: string; entries: SE[] }) {
  return (
    <div className="min-w-[220px]">
      <div className="mb-3 font-medium text-sm text-[#0f172a]">{day}</div>
      <div className="space-y-2">
        {entries.map((e) => (
          <ScheduleEntry key={e.id} entry={e} />
        ))}
      </div>
    </div>
  )
}
