import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScheduleQuery } from '../schedule.queries'
import { useUpdateStatusMutation } from '../schedule.queries'
import RegenerateScheduleModal from '../components/RegenerateScheduleModal'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/shared/EmptyState'
import { ACTIVITY_TYPE_LABELS, SCHEDULE_STATUS_COLORS } from '@/lib/constants'
import type { ScheduleEntry } from '../schedule.types'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']


function sortDayEntries(entries: ScheduleEntry[]) {
  return [...entries].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getStatusForEntry(entry: ScheduleEntry): string {
  // If entry is still pending and end_time has passed, mark as overdue
  if (entry.status === 'pending') {
    const endTime = new Date(entry.end_time).getTime()
    const now = new Date().getTime()
    if (endTime < now) {
      return 'overdue'
    }
  }
  return entry.status
}

export default function SchedulePage() {
  const [open, setOpen] = useState(false)
  const [selectedDayIdx, setSelectedDayIdx] = useState(() => {
    const d = new Date().getDay() // 0=Sun,1=Mon...
    return (d + 6) % 7 // map so Monday=0
  })
  const q = useScheduleQuery()
  const navigate = useNavigate()
  const updateStatusMutation = useUpdateStatusMutation()

  const entries = useMemo(() => q.data?.entries ?? [], [q.data?.entries])

  const entriesByDay = useMemo(() => {
    const grouped: Record<string, ScheduleEntry[]> = {}
    entries.forEach((entry) => {
      const dayName = new Date(entry.start_time).toLocaleDateString(undefined, { weekday: 'long' })
      grouped[dayName] = grouped[dayName] ? [...grouped[dayName], entry] : [entry]
    })
    Object.keys(grouped).forEach((day) => {
      grouped[day] = sortDayEntries(grouped[day])
    })
    return grouped
  }, [entries])

  const currentDayEntries = entriesByDay[days[selectedDayIdx]] ?? []

  if (q.isLoading) return <div className="p-6"><Spinner /></div>

  if (!entries.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Weekly Schedule</h2>
            <p className="text-sm text-[#64748b]">A balanced study plan with lessons, breaks, and hobbies.</p>
          </div>
          <button
            className="rounded-2xl bg-[#607afb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f6ae8]"
            onClick={() => setOpen(true)}
          >
            Regenerate
          </button>
        </div>

        <EmptyState heading="No schedule available" subtext="Create a weekly plan by regenerating your schedule." />
        <RegenerateScheduleModal open={open} onClose={() => setOpen(false)} />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f8f9fc]">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-2">
        <div className="flex h-full min-h-0 flex-col space-y-4">
          {/* Header Card */}
          <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Schedule</div>
                <div className="mt-2 text-xl font-semibold text-[#0f172a]">My Schedule</div>
                <p className="mt-2 text-sm text-[#64748b]">Your weekly routine is generated from your subjects, availability, and hobbies.</p>
              </div>
              <div>
                <button
                  className="rounded-2xl border border-[#607afb] bg-[#607afb] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4f6ae8]"
                  onClick={() => setOpen(true)}
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="rounded-2xl bg-[#f8fafc] p-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dayShort.map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      className={`min-w-[70px] rounded-2xl border px-4 py-2 text-sm font-semibold transition ${selectedDayIdx === idx ? 'bg-[#607afb] text-white border-[#607afb] shadow-md' : 'bg-white text-[#64748b] border-[#e9eaf2] hover:text-[#607afb]'}`}
                      onClick={() => setSelectedDayIdx(idx)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table Card - fills remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e6e9f4] bg-white shadow-sm">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead>
                    <tr className="bg-[#f8f9fc]">
                      <th className="sticky top-0 z-20 w-36 px-6 py-4 text-sm font-semibold uppercase text-[#64748b] bg-[#f8f9fc]">Time</th>
                      <th className="sticky top-0 z-20 px-6 py-4 text-sm font-semibold uppercase text-[#64748b] bg-[#f8f9fc]">Activity</th>
                      <th className="sticky top-0 z-20 w-[150px] px-6 py-4 text-sm font-semibold uppercase text-[#64748b] bg-[#f8f9fc]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDayEntries.length > 0 ? (
                      currentDayEntries.map((entry) => (
                        <tr
                          key={entry.id}
                          className={`border-t border-[#f1f3f9] transition ${entry.related_lesson_id ? 'cursor-pointer hover:bg-[#f8fbff]' : ''}`}
                          onClick={() => entry.related_lesson_id && navigate(`/app/lesson/${entry.related_lesson_id}`)}
                        >
                          <td className="w-36 px-6 py-5 align-top">
                            <div className="font-semibold text-[#0f172a]">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="font-semibold text-[#0f172a]">{entry.title}</div>
                            <div className="text-xs text-[#64748b] mt-1">{ACTIVITY_TYPE_LABELS[entry.activity_type] ?? entry.activity_type}</div>
                          </td>
                          <td className="w-[150px] px-6 py-5 align-top">
                            <div className="flex justify-start">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  updateStatusMutation.mutate({
                                    entryId: entry.id,
                                    status: entry.status === 'completed' ? 'pending' : 'completed',
                                  })
                                }}
                                disabled={updateStatusMutation.isPending}
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                                  SCHEDULE_STATUS_COLORS[getStatusForEntry(entry)] ?? 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {getStatusForEntry(entry)}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-[#64748b]">
                          No activities scheduled for this day.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <RegenerateScheduleModal open={open} onClose={() => setOpen(false)} />
        </div>
      </div>
    </div>
  )
}
