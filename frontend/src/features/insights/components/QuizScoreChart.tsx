import type { SubjectProgress } from '../insights.types'

export default function QuizScoreChart({ subjectProgress }: { subjectProgress: SubjectProgress[] }) {
  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
      <div className="mb-4 text-sm font-medium text-[#0f172a]">Subject progress</div>
      <div className="space-y-4">
        {subjectProgress.map((subject) => (
          <div key={subject.subject_id}>
            <div className="flex items-center justify-between text-sm text-[#0f172a]">
              <span>{subject.subject_name}</span>
              <span>{subject.progress_percentage}%</span>
            </div>
            <div className="h-3 rounded-full bg-[#e2e8f0]">
              <div className="h-3 rounded-full bg-[#607afb]" style={{ width: `${subject.progress_percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
