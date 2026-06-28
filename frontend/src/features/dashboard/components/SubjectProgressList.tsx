import { Card } from '@/components/ui/Card'
import type { SubjectSummary } from '../dashboard.types'

interface SubjectProgressListProps {
  subjects: SubjectSummary[]
}

const progressColors = ['#607afb', '#10b981', '#f59e0b']

interface SubjectProgressListPropsExt extends SubjectProgressListProps {
  className?: string
}

export function SubjectProgressList({ subjects, className }: SubjectProgressListPropsExt) {
  const displaySubjects: SubjectSummary[] = subjects ?? []

  return (
    <Card className={`rounded-3xl p-5 flex flex-col ${className ?? ''}`}>
      <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Subject Progress</div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {displaySubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No subjects available yet.
          </div>
        ) : (
          displaySubjects.map((subject, index) => {
            const progress = Math.max(0, Math.min(100, Math.round(subject.progress_percentage)))
            const barColor = progressColors[index % progressColors.length]
            return (
              <div key={subject.id} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#0f172a]">{subject.name}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#607afb]">{progress}%</div>
                </div>
                <div className="h-2 rounded-full bg-[#e9eaf2] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: barColor }} />
                </div>
                <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                  <span>{subject.completed_lessons} of {subject.total_lessons} lessons</span>
                  <span>{subject.weekly_hours}h/week</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
