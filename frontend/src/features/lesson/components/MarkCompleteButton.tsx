import { useMarkCompleteMutation } from '../lesson.queries'

interface MarkCompleteButtonProps {
  lessonId: string
  completed?: boolean
}

export function MarkCompleteButton({
  lessonId,
}: MarkCompleteButtonProps) {
  const mutation = useMarkCompleteMutation()

  return (
    <button
      className="inline-flex items-center gap-2 rounded-xl bg-[#607afb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f63df] disabled:cursor-not-allowed disabled:opacity-60"
      onClick={() => mutation.mutate(lessonId)}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Marking…' : 'Mark Complete'}
    </button>
  )
}