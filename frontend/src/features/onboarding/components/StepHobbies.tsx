import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { saveHobbies } from '../onboarding.api'

interface StepHobbiesProps {
  onNext: () => void
}

export default function StepHobbies({ onNext }: StepHobbiesProps) {
  const [hobby, setHobby] = useState('')
  const [hobbies, setHobbies] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (data: string[]) => saveHobbies(data),
    onSuccess: () => onNext(),
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save hobbies.')
    },
  })

  const addHobby = () => {
    const trimmed = hobby.trim()
    if (!trimmed) return
    if (hobbies.includes(trimmed)) {
      setErrorMessage('This hobby is already added.')
      return
    }
    setHobbies((current) => [...current, trimmed])
    setHobby('')
    setErrorMessage('')
  }

  const removeHobby = (index: number) => {
    setHobbies((current) => current.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    if (hobbies.length === 0) {
      setErrorMessage('Please add at least one hobby.')
      return
    }
    mutation.mutate(hobbies)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#e9eaf2] bg-[#f8fafc] p-5 sm:p-6">
        <div className="inline-flex rounded-full border border-[#dbe4ff] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#607afb]">
          Step 3
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[#0f172a]">Your interests</h2>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Add hobbies and interests to help us personalize your recommendations and pace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[24px] border border-[#e9eaf2] bg-white p-5 shadow-sm sm:p-6">
      <div className="space-y-3 rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 shadow-sm">
        <div className="text-sm font-medium text-[#0f172a]">Add your hobbies</div>
        <p className="text-sm text-[#64748b]">Add hobbies to personalize your learning experience.</p>

        <div className="flex gap-3">
          <input
            value={hobby}
            onChange={(event) => setHobby(event.target.value)}
            placeholder="Type a hobby"
            className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
          />
          <Button type="button" onClick={addHobby} variant="secondary">
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {hobbies.map((item, index) => (
            <button
              key={item + index}
              type="button"
              onClick={() => removeHobby(index)}
              className="rounded-full border border-[#e9eaf2] bg-[#f8fafc] px-3 py-1 text-sm text-[#475569] hover:bg-[#eef2ff]"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}

      <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
        {mutation.status === 'pending' ? 'Saving hobbies…' : 'Continue'}
      </Button>
      </form>
    </div>
  )
}
