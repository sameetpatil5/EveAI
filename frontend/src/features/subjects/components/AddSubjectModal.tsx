import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { SUBJECT_LEVELS } from '@/lib/constants'
import { useCreateSubjectMutation } from '../subjects.queries'
import type { SubjectCreate } from '../subjects.types'

interface AddSubjectModalProps {
  open: boolean
  onClose: () => void
}

const initialSubject: SubjectCreate = {
  name: '',
  level: SUBJECT_LEVELS[0],
  priority: 1,
  weekly_hours: 1,
  target_weeks: 1,
  goal: undefined,
}

export function AddSubjectModal({ open, onClose }: AddSubjectModalProps) {
  const [subject, setSubject] = useState<SubjectCreate>(initialSubject)
  const [message, setMessage] = useState<string | null>(null)
  const mutation = useCreateSubjectMutation()

  useEffect(() => {
    if (mutation.isSuccess) {
      setSubject(initialSubject)
      onClose()
    }
  }, [mutation.isSuccess, onClose])

  useEffect(() => {
    if (!open) {
      setMessage(null)
      setSubject(initialSubject)
    }
  }, [open])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!subject.name.trim()) {
      setMessage('Subject name is required.')
      return
    }

    if (subject.priority < 1) {
      setMessage('Priority must be at least 1.')
      return
    }

    if (subject.weekly_hours < 1) {
      setMessage('Weekly hours must be at least 1.')
      return
    }

    if (subject.target_weeks < 1) {
      setMessage('Target weeks must be at least 1.')
      return
    }

    mutation.mutate({
      ...subject,
      name: subject.name.trim(),
      goal: subject.goal?.trim() || undefined,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add subject">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#475569]">Subject name</label>
          <input
            value={subject.name}
            onChange={(event) => setSubject((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            placeholder="e.g. Mathematics"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#475569]">Expertise level</label>
            <select
              value={subject.level}
              onChange={(event) => setSubject((current) => ({ ...current, level: event.target.value }))}
              className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            >
              {SUBJECT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#475569]">Priority</label>
            <input
              type="number"
              min={1}
              value={subject.priority}
              onChange={(event) => setSubject((current) => ({ ...current, priority: Number(event.target.value) }))}
              className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#475569]">Weekly hours</label>
            <input
              type="number"
              min={1}
              value={subject.weekly_hours}
              onChange={(event) => setSubject((current) => ({ ...current, weekly_hours: Number(event.target.value) }))}
              className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#475569]">Target weeks</label>
            <input
              type="number"
              min={1}
              value={subject.target_weeks}
              onChange={(event) => setSubject((current) => ({ ...current, target_weeks: Number(event.target.value) }))}
              className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#475569]">Learning goal</label>
          <textarea
            value={subject.goal ?? ''}
            onChange={(event) => setSubject((current) => ({ ...current, goal: event.target.value }))}
            className="min-h-[120px] w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb]"
            placeholder="Optional goal or exam target"
          />
        </div>

        {message ? <div className="rounded-3xl bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">{message}</div> : null}
        {mutation.isError ? (
          <div className="rounded-3xl bg-[#f8d7da] px-4 py-3 text-sm text-[#842029]">
            {mutation.error?.message ?? 'Unable to create subject.'}
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Adding subject…' : 'Add subject'}
        </Button>
      </form>
    </Modal>
  )
}
