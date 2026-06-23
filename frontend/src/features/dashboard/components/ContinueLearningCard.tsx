import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

interface ContinueLearningCardProps {
  lastLessonId: string | null
}

export function ContinueLearningCard({ lastLessonId }: ContinueLearningCardProps) {
  if (!lastLessonId) {
    return (
      <Card className="p-5 text-center">
        <div className="text-sm font-semibold text-[#0f172a]">Ready to learn?</div>
        <p className="mt-2 text-sm text-[#64748b]">Start a course to build your learning streak.</p>
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <div className="text-sm font-medium text-[#475569]">Continue learning</div>
      <div className="mt-4 space-y-4">
        <div className="text-lg font-semibold text-[#0f172a]">Resume your last lesson</div>
        <Link
          to={`/app/lesson/${lastLessonId}`}
          className="inline-flex items-center justify-center rounded-lg bg-[#607afb] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#4f63df]"
        >
          Resume
        </Link>
      </div>
    </Card>
  )
}
