import { useMemo, useState } from 'react'
import { useScheduleQuery } from '../schedule.queries'
import WeekView from '../components/WeekView'
import RegenerateScheduleModal from '../components/RegenerateScheduleModal'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/shared/EmptyState'
import type { ScheduleEntry } from '../schedule.types'

function getWeekStart(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const dayOfWeek = d.getUTCDay()
  const diff = (dayOfWeek + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

function formatWeekLabel(date: Date) {
  return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function SchedulePage() {
  const [open, setOpen] = useState(false)
  const [activeWeekKey, setActiveWeekKey] = useState<string | null>(null)
  const q = useScheduleQuery()

  const entries = useMemo(() => q.data?.entries ?? [], [q.data?.entries])

  const weeks = useMemo(() => {
    const map = new Map<string, { weekKey: string; label: string; startDate: Date; entries: ScheduleEntry[] }>()

    entries.forEach((entry) => {
      const date = new Date(entry.start_time)
      if (Number.isNaN(date.getTime())) return

      const startDate = getWeekStart(date)
      const weekKey = startDate.toISOString().slice(0, 10)
      const existing = map.get(weekKey)

      if (existing) {
        existing.entries.push(entry)
      } else {
        map.set(weekKey, {
          weekKey,
          label: formatWeekLabel(startDate),
          startDate,
          entries: [entry],
        })
      }
    })

    return [...map.values()].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  }, [entries])

  const selectedWeekKey = activeWeekKey || weeks[0]?.weekKey || null
  const activeWeek = weeks.find((week) => week.weekKey === selectedWeekKey) ?? weeks[0]

  if (q.isLoading) return <div className="p-6"><Spinner /></div>

  if (!entries.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Schedule</h2>
          <button className="rounded-lg bg-[#607afb] px-3 py-2 text-white" onClick={() => setOpen(true)}>
            Regenerate
          </button>
        </div>
        <EmptyState heading="No schedule available" subtext="We couldn't find any scheduled items." />
        <RegenerateScheduleModal open={open} onClose={() => setOpen(false)} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Schedule</h2>
        <button className="rounded-lg bg-[#607afb] px-3 py-2 text-white" onClick={() => setOpen(true)}>
          Regenerate
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {weeks.map((week) => (
          <button
            key={week.weekKey}
            type="button"
            className={`rounded-full px-4 py-2 text-sm ${week.weekKey === selectedWeekKey ? 'bg-[#607afb] text-white' : 'bg-white text-[#475569] border border-[#e9eaf2]'}`}
            onClick={() => setActiveWeekKey(week.weekKey)}
          >
            {week.label}
          </button>
        ))}
      </div>
      {activeWeek ? <WeekView entries={activeWeek.entries} /> : null}

      <RegenerateScheduleModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
