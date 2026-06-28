import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { SUBJECT_LEVELS } from '@/lib/constants'
import { saveSubjects } from '../onboarding.api'
import type { SubjectInput } from '../onboarding.types'

interface StepSubjectsProps {
  onNext: () => void
}

const defaultSubject: SubjectInput = {
  name: '',
  level: SUBJECT_LEVELS[0],
  priority: 1,
  weekly_hours: 1,
  target_weeks: 1,
  goal: '',
}

export default function StepSubjects({ onNext }: StepSubjectsProps) {
  const [subjects, setSubjects] = useState<SubjectInput[]>([{ ...defaultSubject }])
  const [errorMessage, setErrorMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (data: SubjectInput[]) => saveSubjects(data),
    onSuccess: () => onNext(),
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save subjects.')
    },
  })

  const updateSubject = (index: number, field: keyof SubjectInput, value: string | number) => {
    setSubjects((current) =>
      current.map((subject, idx) =>
        idx === index ? { ...subject, [field]: value } : subject,
      ),
    )
  }

  const addSubject = () => setSubjects((current) => [...current, { ...defaultSubject }])

  const removeSubject = (index: number) => {
    if (subjects.length === 1) return
    setSubjects((current) => current.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    const invalid = subjects.some((subject) => !subject.name.trim() || subject.priority < 1 || subject.weekly_hours < 1 || subject.target_weeks < 1)
    if (invalid) {
      setErrorMessage('Please complete all required subject fields.')
      return
    }

    mutation.mutate(subjects.map((subject) => ({
      ...subject,
      name: subject.name.trim(),
      goal: subject.goal?.trim() || undefined,
    })))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-[#e9eaf2] bg-[#f8fafc] p-5 sm:p-6">
        <div className="inline-flex rounded-full border border-[#dbe4ff] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#607afb]">
          Step 2
        </div>
        <h2 className="mt-4 text-xl font-semibold text-[#0f172a]">Your subjects</h2>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">
          Add the subjects you want to study so we can build a structured course plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[24px] border border-[#e9eaf2] bg-white p-5 shadow-sm sm:p-6">
      {subjects.map((subject, index) => (
        <div key={index} className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-[#0f172a]">Subject {index + 1}</p>
              <p className="text-xs text-[#64748b]">Enter subject details</p>
            </div>
            {subjects.length > 1 ? (
              <button
                type="button"
                onClick={() => removeSubject(index)}
                className="text-sm text-[#991b1b] hover:text-[#7f1d1d]"
              >
                Remove
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[#475569]">
              <span>Name</span>
              <input
                value={subject.name}
                onChange={(event) => updateSubject(index, 'name', event.target.value)}
                placeholder="Subject name"
                className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-[#475569]">
              <span>Level</span>
              <select
                value={subject.level}
                onChange={(event) => updateSubject(index, 'level', event.target.value)}
                className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
              >
                {SUBJECT_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-[#475569]">
              <span>Priority</span>
              <input
                value={subject.priority}
                onChange={(event) => updateSubject(index, 'priority', Number(event.target.value))}
                type="number"
                min={1}
                max={10}
                className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
              />
            </label>
            <label className="space-y-2 text-sm text-[#475569]">
              <span>Weekly hours</span>
              <input
                value={subject.weekly_hours}
                onChange={(event) => updateSubject(index, 'weekly_hours', Number(event.target.value))}
                type="number"
                min={1}
                className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
              />
            </label>
            <label className="space-y-2 text-sm text-[#475569]">
              <span>Target weeks</span>
              <input
                value={subject.target_weeks}
                onChange={(event) => updateSubject(index, 'target_weeks', Number(event.target.value))}
                type="number"
                min={1}
                className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-[#475569]">
            <span>Goal (optional)</span>
            <input
              value={subject.goal ?? ''}
              onChange={(event) => updateSubject(index, 'goal', event.target.value)}
              placeholder="Describe your goal"
              className="w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
            />
          </label>
        </div>
      ))}

      {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={addSubject} className="w-full sm:w-auto">
          Add subject
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Saving subjects…' : 'Continue'}
        </Button>
      </div>
      </form>
    </div>
  )
}
