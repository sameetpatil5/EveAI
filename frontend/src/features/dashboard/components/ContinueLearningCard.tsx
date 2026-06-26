import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

interface ContinueLearningCardProps {
  lastLessonId: string | null
  className?: string
}

export function ContinueLearningCard({ lastLessonId, className }: ContinueLearningCardProps) {
  const lessonTitle = lastLessonId ? 'Resume your last lesson' : '[Last Lesson Title]'

  return (
    <Card className={`p-3 flex flex-col justify-center ${className ?? ''}`}>
      <div className="text-xs font-medium text-[#475569] mb-2">Continue learning</div>
      <div className="text-sm font-semibold text-[#0f172a] mb-2">{lessonTitle}</div>
      {lastLessonId ? (
        <Link
          to={`/app/lesson/${lastLessonId}`}
          className="inline-flex items-center justify-center rounded-md bg-[#607afb] px-3 py-1 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#4f63df]"
        >
          Resume
        </Link>
      ) : (
        <button
          disabled
          className="inline-flex items-center justify-center rounded-md bg-[#cbd5e1] px-3 py-1 text-xs font-semibold text-[#64748b] cursor-not-allowed"
        >
          Resume
        </button>
      )}
    </Card>
  )
}
