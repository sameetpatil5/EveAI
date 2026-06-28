import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUpdateProfileMutation } from '../profile.queries'
import type { Profile } from '../profile.types'

export default function PreferencesSection({
  available_time_slots,
}: {
  available_time_slots: Profile['profile']['available_time_slots']
}) {
  const [editing, setEditing] = useState(false)
  const [slots, setSlots] = useState(available_time_slots ?? [])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const mutation = useUpdateProfileMutation()

  const addSlot = () => {
    if (!start || !end) {
      setErrorMessage('[Both start and end are required.]')
      return
    }

    if (start >= end) {
      setErrorMessage('[End time must be after start time.]')
      return
    }

    setSlots((current) => [...current, { start, end }])
    setStart('')
    setEnd('')
    setErrorMessage('')
  }

  const removeSlot = (index: number) => {
    setSlots((current) => current.filter((_, idx) => idx !== index))
  }

  const formatTime = (t?: string) => {
    if (!t) return '[9:00 AM]'
    const m = t.match(/^(\d{1,2}):(\d{2})/)
    if (!m) return t
    const hh = Number(m[1])
    const mm = m[2]
    const am = hh < 12
    const displayHour = ((hh + 11) % 12) + 1
    return `${displayHour}:${mm} ${am ? 'AM' : 'PM'}`
  }

  const getDurationHours = (start: string, end: string) => {
    if (!start || !end) return '[7 hours]'
    try {
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const startMin = sh * 60 + sm
      let endMin = eh * 60 + em
      if (endMin < startMin) endMin += 24 * 60
      const diff = endMin - startMin
      const hrs = Math.floor(diff / 60)
      return `${hrs} hours`
    } catch {
      return '[7 hours]'
    }
  }

  const handleSave = async () => {
    if (slots.length === 0) {
      setErrorMessage('[Please add at least one availability slot.]')
      return
    }

    setErrorMessage('')
    await mutation.mutateAsync({ available_time_slots: slots })
    setEditing(false)
  }

  return (
    <div className="flex flex-1 flex-col rounded-[10px] border border-[#e9eaf2] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between px-2 py-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Preferred Study Time</div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setEditing((current) => !current)}
          className="rounded-lg border border-[#e9eaf2] bg-[#f8f9fc] px-3 py-2 text-sm font-semibold text-[#0f172a] hover:bg-[#eef2ff]"
        >
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="p-2 space-y-2">
        <div className="space-y-3">
          {slots.length === 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#e9eaf2] bg-[#f8fafc] px-2 py-2">
              <p className="text-sm text-[#475569]">[No availability slots configured.]</p>
            </div>
          ) : (
            slots.map((slot, index) => (
              <div key={`${slot.start}-${slot.end}-${index}`} className="flex flex-wrap items-center gap-3 rounded-[8px] border border-[#e9eaf2] bg-[#f8fafc] px-2 py-2">
                <div>
                  <div className="text-[11px] text-[#94a3b8]">Start</div>
                  <div className="text-[16px] font-semibold text-[#0f172a]">{formatTime(slot.start)}</div>
                </div>
                <div className="text-[16px] font-light text-[#94a3b8]">—</div>
                <div>
                  <div className="text-[11px] text-[#94a3b8]">End</div>
                  <div className="text-[16px] font-semibold text-[#0f172a]">{formatTime(slot.end)}</div>
                </div>
                <div className="ml-1">
                  <div className="text-[11px] text-[#94a3b8]">Duration</div>
                  <div className="text-[16px] font-semibold text-[#0f172a]">{getDurationHours(slot.start, slot.end)}</div>
                </div>
                {editing ? (
                  <button type="button" onClick={() => removeSlot(index)} className="text-sm text-[#991b1b] hover:text-[#7f1d1d]">
                    Remove
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-[#475569]">
                <span>Start time</span>
                <input
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-[#475569]">
                <span>End time</span>
                <input
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
                />
              </label>
            </div>
            {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={addSlot}>
                Add time slot
              </Button>
              <Button type="button" onClick={handleSave} disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
