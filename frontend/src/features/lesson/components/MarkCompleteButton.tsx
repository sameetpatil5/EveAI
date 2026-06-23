import { useMarkCompleteMutation } from '../lesson.queries'

interface MarkCompleteButtonProps {
  lessonId: string
  completed: boolean
}

export function MarkCompleteButton({ lessonId, completed }: MarkCompleteButtonProps) {
  const mutation = useMarkCompleteMutation()

  if (completed) {
    return <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">Completed ✓</div>
  }

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg bg-[#607afb] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f63df] disabled:opacity-60"
      onClick={() => mutation.mutate(lessonId)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Marking…' : 'Mark Complete'}
    </button>
  )
}
