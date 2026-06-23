import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { Subject } from '../subjects.types'

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const navigate = useNavigate()
  const progress = Math.max(0, Math.min(100, subject.progress_percentage))
  const hasCourse = Boolean(subject.course_id)

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-[#475569]">
            {subject.level}
          </div>
          <h3 className="mt-3 text-xl font-semibold text-[#0f172a]">{subject.name}</h3>
        </div>
        <div className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-semibold uppercase text-[#2563eb]">
          priority {subject.priority}
        </div>
      </div>

      <p className="mb-4 text-sm text-[#64748b]">
        {subject.goal ?? 'No learning goal provided.'}
      </p>

      <div className="mb-4 space-y-3 text-sm text-[#475569]">
        <div className="flex justify-between">
          <span>Weekly hours</span>
          <span>{subject.weekly_hours}</span>
        </div>
        <div className="flex justify-between">
          <span>Target weeks</span>
          <span>{subject.target_weeks}</span>
        </div>
        <div className="flex justify-between capitalize">
          <span>Status</span>
          <span>{subject.status}</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm font-medium text-[#475569]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e9eaf2]">
          <div className="h-full rounded-full bg-[#607afb] transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Button
        className="w-full"
        variant={hasCourse ? 'default' : 'secondary'}
        disabled={!hasCourse}
        onClick={() => {
          if (subject.course_id) {
            navigate(`/app/course/${subject.course_id}`)
          }
        }}
      >
        {hasCourse ? 'Open Course' : 'No course yet'}
      </Button>
    </Card>
  )
}
