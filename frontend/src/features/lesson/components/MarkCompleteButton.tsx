import { useMarkCompleteMutation } from '../lesson.queries'
import { Check } from 'lucide-react'

interface MarkCompleteButtonProps {
  lessonId: string
  completed: boolean
}

export function MarkCompleteButton({ lessonId, completed }: MarkCompleteButtonProps) {
  const mutation = useMarkCompleteMutation()

  if (completed) {
    return (
      <div className="flex items-center justify-center rounded-full bg-green-100 p-1 text-green-700">
        <Check size={16} />
      </div>
    )
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-[#607afb] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#4f63df] disabled:opacity-60"
      onClick={() => mutation.mutate(lessonId)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Marking…' : 'Mark Complete'}
    </button>
  )
}
