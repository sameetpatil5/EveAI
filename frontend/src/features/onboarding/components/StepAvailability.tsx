import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { saveAvailability } from '../onboarding.api'
import type { AvailabilitySlot } from '../onboarding.types'

interface StepAvailabilityProps {
  onNext: () => void
}

export default function StepAvailability({ onNext }: StepAvailabilityProps) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (slots: AvailabilitySlot[]) =>
      saveAvailability({
        available_time_slots: slots,
      }),
    onSuccess: () => onNext(),
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save availability.')
    },
  })


  const addSlot = () => {
    if (!start || !end) {
      setErrorMessage('Both start and end times are required.')
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    if (slots.length === 0) {
      setErrorMessage('Please add at least one availability slot.')
      return
    }
    mutation.mutate(slots)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-[#e9eaf2] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[#475569]">
            <span>Start time</span>
            <input
              type="time"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
            />
          </label>
          <label className="space-y-2 text-sm text-[#475569]">
            <span>End time</span>
            <input
              type="time"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
            />
          </label>
        </div>

        <Button type="button" variant="secondary" onClick={addSlot} className="mt-3">
          Add availability
        </Button>

        <div className="mt-4 space-y-3">
          {slots.map((slot, index) => (
            <div key={`${slot.start}-${slot.end}-${index}`} className="flex items-center justify-between rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3">
              <div className="text-sm text-[#0f172a]">{slot.start} — {slot.end}</div>
              <button
                type="button"
                onClick={() => removeSlot(index)}
                className="text-sm text-[#991b1b] hover:text-[#7f1d1d]"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}

      <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
        {mutation.status === 'pending' ? 'Saving availability…' : 'Continue'}
      </Button>
    </form>
  )
}
