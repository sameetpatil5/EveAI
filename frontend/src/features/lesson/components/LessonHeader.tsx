import { Check } from 'lucide-react'
import { MarkCompleteButton } from './MarkCompleteButton'

interface LessonHeaderProps {
  lessonId: string
  title: string
  completed: boolean
}

export function LessonHeader({
  lessonId,
  title,
  completed,
}: LessonHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-[#0f172a]">
        {title}
      </h1>

      {completed ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
          <Check size={18} />
        </div>
      ) : (
        <MarkCompleteButton
          lessonId={lessonId}
          completed={completed}
        />
      )}
    </div>
  )
}