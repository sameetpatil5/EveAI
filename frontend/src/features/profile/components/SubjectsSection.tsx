import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUpdateProfileMutation } from '../profile.queries'
import type { Profile } from '../profile.types'

export default function SubjectsSection({ subjects }: { subjects: Profile['subjects'] }) {
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

  const displaySubjects = localSubjects.length
    ? localSubjects
    : [
        { id: 'placeholder-1', name: '[Subject Name]', priority: 3, weekly_hours: 6, goal: '[Goal]' },
        { id: 'placeholder-2', name: '[Subject Name]', priority: 7, weekly_hours: 8, goal: '[Goal]' },
        { id: 'placeholder-3', name: '[Subject Name]', priority: 9, weekly_hours: 10, goal: '[Goal]' },
      ]

  const getBadgeClass = (priority: number) => {
    if (priority >= 8) return 'bg-[#fee2e2] text-[#ef4444]'
    if (priority >= 5) return 'bg-[#fef3c7] text-[#f59e0b]'
    return 'bg-[#d1fae5] text-[#10b981]'
  }

  const getProgressColor = (priority: number) => {
    if (priority >= 8) return '#f59e0b'
    if (priority >= 5) return '#10b981'
    return '#607afb'
  }

  const getProgressWidth = (priority: number) => `${Math.min(100, 24 + priority * 4)}%`

  return (
    <div className="h-full flex min-h-0 flex-1 flex-col rounded-[10px] border border-[#e9eaf2] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between border-b border-[#e9eaf2] px-5 py-4">
        <div>
          <div className="text-[14px] font-semibold uppercase tracking-[0.04em] text-[#0f172a]">Subjects</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5 pt-4">
        <div className="overflow-x-auto pb-1">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#e9eaf2] text-left text-[11px] font-bold uppercase tracking-[0.04em] text-[#94a3b8]">
                <th className="pb-3 pr-3">Subject</th>
                <th className="pb-3 pr-3">Priority</th>
                <th className="pb-3 pr-3">Weekly Hours</th>
                <th className="pb-3 pr-3">Progress</th>
                <th className="pb-3">Goal</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto pr-1 pb-5">
          <table className="w-full border-collapse text-[13px]">
            <tbody>
              {displaySubjects.map((subject) => (
                <tr key={subject.id} className="border-b border-[#e9eaf2] last:border-b-0">
                  <td className="py-3 pr-3 font-semibold text-[#0f172a]">{subject.name}</td>
                  <td className="py-3 pr-3">
                    {editing ? (
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={subject.priority}
                        onChange={(event) => handleChange(subject.id, 'priority', event.target.value)}
                        className="w-20 rounded-lg border border-[#e9eaf2] px-3 py-2"
                      />
                    ) : (
                      <span className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-[6px] text-[12px] font-bold ${getBadgeClass(subject.priority)}`}>
                        {subject.priority}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-[#475569]">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={subject.weekly_hours}
                        onChange={(event) => handleChange(subject.id, 'weekly_hours', event.target.value)}
                        className="w-24 rounded-lg border border-[#e9eaf2] px-3 py-2"
                      />
                    ) : (
                      `${subject.weekly_hours}h / week`
                    )}
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-[5px] w-[80px] overflow-hidden rounded-[3px] bg-[#e9eaf2]">
                        <div className="h-full rounded-[3px]" style={{ width: getProgressWidth(subject.priority), backgroundColor: getProgressColor(subject.priority) }} />
                      </div>
                      <span className="text-[12px] text-[#94a3b8]">{Math.max(10, Math.min(99, 20 + subject.priority * 4))}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-[#475569]">
                    {editing ? (
                      <input
                        value={subject.goal ?? ''}
                        onChange={(event) => handleChange(subject.id, 'goal', event.target.value)}
                        className="w-full rounded-lg border border-[#e9eaf2] px-3 py-2"
                      />
                    ) : (
                      <div className="max-w-[200px] text-[12px] text-[#64748b]">{subject.goal ?? '[Goal]'}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="border-t border-[#e9eaf2] px-5 py-4">
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
