import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useUpdateProfileMutation } from '../profile.queries'
import type { Profile } from '../profile.types'

export default function SubjectsSection({
  subjects,
}: {
  subjects: Profile['subjects']
}) {
  const [editing, setEditing] = useState(false)
  const [localSubjects, setLocalSubjects] = useState(subjects ?? [])
  const mutation = useUpdateProfileMutation()

  useEffect(() => {
    setLocalSubjects(subjects ?? [])
  }, [subjects])

  const handleChange = (id: string, field: 'priority' | 'weekly_hours' | 'goal', value: string) => {
    setLocalSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? {
              ...subject,
              [field]: field === 'goal' ? value : Number(value),
            }
          : subject,
      ),
    )
  }

  const handleSave = async () => {
    await mutation.mutateAsync({
      subjects: localSubjects.map(({ id, priority, weekly_hours, goal }) => ({
        id,
        priority,
        weekly_hours,
        goal,
      })),
    })
    setEditing(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-[#e9eaf2] px-6 py-4">
        <div>
          <div className="text-lg font-semibold text-[#0f172a]">Subjects</div>
          <div className="text-sm text-[#64748b]">Review and update your subject priorities.</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="overflow-x-auto p-6">
        <table className="min-w-full table-auto border-separate border-spacing-y-3">
          <thead>
            <tr className="text-left text-sm text-[#475569]">
              <th className="pb-2">Subject</th>
              <th className="pb-2">Priority</th>
              <th className="pb-2">Weekly Hours</th>
              <th className="pb-2">Goal</th>
            </tr>
          </thead>
          <tbody>
            {localSubjects.map((subject) => (
              <tr key={subject.id} className="rounded-3xl bg-[#f8fafc]">
                <td className="px-4 py-3 text-sm text-[#0f172a]">{subject.name}</td>
                <td className="px-4 py-3">
                  {editing ? (
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={subject.priority}
                      onChange={(event) => handleChange(subject.id, 'priority', event.target.value)}
                      className="w-24 rounded-lg border border-[#e9eaf2] px-3 py-2"
                    />
                  ) : (
                    <span className="text-sm text-[#0f172a]">{subject.priority}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing ? (
                    <input
                      type="number"
                      min={0}
                      value={subject.weekly_hours}
                      onChange={(event) => handleChange(subject.id, 'weekly_hours', event.target.value)}
                      className="w-24 rounded-lg border border-[#e9eaf2] px-3 py-2"
                    />
                  ) : (
                    <span className="text-sm text-[#0f172a]">{subject.weekly_hours}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing ? (
                    <input
                      value={subject.goal ?? ''}
                      onChange={(event) => handleChange(subject.id, 'goal', event.target.value)}
                      className="w-full rounded-lg border border-[#e9eaf2] px-3 py-2"
                    />
                  ) : (
                    <span className="text-sm text-[#0f172a]">{subject.goal ?? 'No goal set'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="px-6 pb-6">
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
