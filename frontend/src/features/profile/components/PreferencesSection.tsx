import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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

  useEffect(() => {
    setSlots(available_time_slots ?? [])
  }, [available_time_slots])

  const addSlot = () => {
    if (!start || !end) {
      setErrorMessage('Both start and end are required.')
      return
    }

    if (start >= end) {
      setErrorMessage('End time must be after start time.')
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

  const handleSave = async () => {
    if (slots.length === 0) {
      setErrorMessage('Please add at least one availability slot.')
      return
    }

    setErrorMessage('')
    await mutation.mutateAsync({ available_time_slots: slots })
    setEditing(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-[#e9eaf2] px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-[#0f172a]">Preferences</div>
          <div className="text-sm text-[#64748b]">Set your study availability.</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          {slots.length === 0 ? (
            <p className="text-sm text-[#475569]">No availability slots configured.</p>
          ) : (
            slots.map((slot, index) => (
              <div key={`${slot.start}-${slot.end}-${index}`} className="flex items-center justify-between rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3">
                <span className="text-sm text-[#0f172a]">{slot.start} — {slot.end}</span>
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
    </Card>
  )
}
