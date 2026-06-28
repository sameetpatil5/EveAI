import { Card } from '@/components/ui/Card'
import type { SubjectProgress } from '../insights.types'

interface QuizScoreChartProps {
  subjectProgress: SubjectProgress[]
}

const progressColors = ['#607afb', '#10b981', '#f59e0b']

// Static demo subjects for development
const demoSubjects: SubjectProgress[] = [
  { subject_id: '1', subject_name: '[Mathematics]', progress_percentage: 75 },
  { subject_id: '2', subject_name: '[Physics]', progress_percentage: 60 },
  { subject_id: '3', subject_name: '[Chemistry]', progress_percentage: 85 },
  { subject_id: '4', subject_name: '[Biology]', progress_percentage: 45 },
  { subject_id: '5', subject_name: '[History]', progress_percentage: 90 },
]

export default function QuizScoreChart({ subjectProgress }: QuizScoreChartProps) {
  const displaySubjects = subjectProgress.length > 0 ? subjectProgress : demoSubjects

  return (
    <Card className="rounded-3xl p-6 flex flex-col h-full">
      <div className="mb-6 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#64748b]">Subject Progress</div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {displaySubjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No subjects available yet.
          </div>
        ) : (
          displaySubjects.map((subject, index) => {
            const barColor = progressColors[index % progressColors.length]
            return (
              <div key={subject.subject_id} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#0f172a]">{subject.subject_name}</div>
                  </div>
                  <div className="text-sm font-semibold text-[#607afb]">{subject.progress_percentage}%</div>
                </div>
                <div className="h-2 rounded-full bg-[#e9eaf2] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${subject.progress_percentage}%`, background: barColor }} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
