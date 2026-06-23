import { Progress } from '@/components/ui/Progress'
import { Card } from '@/components/ui/Card'
import type { SubjectSummary } from '../dashboard.types'

interface SubjectProgressListProps {
  subjects: SubjectSummary[]
}

export function SubjectProgressList({ subjects }: SubjectProgressListProps) {
  return (
    <Card className="p-5">
      <div className="mb-5 text-sm font-medium text-[#475569]">Subject progress</div>
      <div className="space-y-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[#0f172a]">{subject.name}</div>
                <div className="text-xs text-[#64748b]">{subject.level}</div>
              </div>
              <div className="text-sm font-medium text-[#475569]">{subject.progress_percentage}%</div>
            </div>
            <Progress value={subject.progress_percentage} />
          </div>
        ))}
      </div>
    </Card>
  )
}
