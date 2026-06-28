import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

interface ContinueLearningCardProps {
  lastLessonId: string | null
  className?: string
}

export function ContinueLearningCard({ lastLessonId, className }: ContinueLearningCardProps) {
  const lessonTitle = lastLessonId ? 'Resume your last lesson' : '[Last Lesson Title]'

  return (
    <Card className={`rounded-3xl p-5 ${className ?? ''}`}>
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Continue learning</div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#0f172a] truncate">{lessonTitle}</div>

        <div className="ml-4 flex-shrink-0">
          {lastLessonId ? (
            <Link
              to={`/app/lesson/${lastLessonId}`}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#607afb] px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#4f63df]"
            >
              Resume
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#cbd5e1] px-4 text-sm font-semibold text-[#64748b] cursor-not-allowed"
            >
              Resume
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
