import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useLessonQuery, useRetryLessonGenerationMutation } from '../lesson.queries'
import { LessonGeneratingState } from '../components/LessonGeneratingState'
import { LessonContent } from '../components/LessonContent'
import { MarkCompleteButton } from '../components/MarkCompleteButton'

export default function LessonPage() {
  const { lessonId } = useParams()
  const queryClient = useQueryClient()

  if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
    return <div className="p-8 text-[#475569]">Invalid lesson selected.</div>
  }

  const { data, status, error } = useLessonQuery(lessonId)
  const retryLessonMutation = useRetryLessonGenerationMutation()

  useEffect(() => {
    // If there's a learningStore, set active lesson here. Safe no-op otherwise.
    ;(async () => {
      try {
        const learningStoreModule: any = await import('@/stores/learning.store')
        const ls: any = learningStoreModule?.default ?? learningStoreModule
        if (ls && typeof ls.setActiveLesson === 'function') {
          try {
            ls.setActiveLesson(lessonId ?? null)
          } catch (e) {
            // ignore runtime errors from store
          }
        }
      } catch (e) {
        // ignore if store/module doesn't exist yet
      }
    })()
  }, [lessonId])

  if (status === 'loading') return <LessonGeneratingState />
  if (status === 'error') return <div className="p-8">Unable to load lesson: {error?.message ?? 'Try again later.'}</div>
  if (!data) return null

  if (data.generation_status === 'failed') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-red-800">Lesson generation failed</h3>
          <p className="mt-2 text-sm text-red-700">{data.error_message ?? 'We could not generate this lesson right now.'}</p>
          <button
            className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={retryLessonMutation.isLoading}
            onClick={() => retryLessonMutation.mutate(lessonId as string)}
          >
            {retryLessonMutation.isLoading ? 'Retrying…' : 'Retry lesson generation'}
          </button>
          {retryLessonMutation.isError && (
            <p className="mt-3 text-sm text-red-700">Retry failed. Please try again.</p>
          )}
        </div>
      </div>
    )
  }

  if (data.generation_status !== 'complete') return <LessonGeneratingState />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#475569]">Lesson</h2>
          <MarkCompleteButton lessonId={data.id} completed={data.completed} />
        </div>

        <LessonContent lesson={data} />
      </div>
    </div>
  )
}
