import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLessonQuery, useRetryLessonGenerationMutation } from '../lesson.queries'
import type { Lesson } from '../lesson.types'
import { LessonGeneratingState } from '../components/LessonGeneratingState'
import { LessonContent } from '../components/LessonContent'
import { MarkCompleteButton } from '../components/MarkCompleteButton'

export default function LessonPage() {
  const { lessonId } = useParams()
  const { data, isLoading, isError, error } = useLessonQuery(lessonId ?? null)
  const retryLessonMutation = useRetryLessonGenerationMutation()

  useEffect(() => {
    // If there's a learningStore, set active lesson here. Safe no-op otherwise.
    ;(async () => {
      try {
        type LearningStore = { setActiveLesson?: (id: string | null) => void }
        const learningStoreModule = await import('@/stores/learning.store')
        const ls: LearningStore = (learningStoreModule as { default?: LearningStore }).default ?? (learningStoreModule as LearningStore)
        if (ls && typeof ls.setActiveLesson === 'function') {
          try {
            ls.setActiveLesson(lessonId ?? null)
          } catch {
            // ignore runtime errors from store
          }
        }
      } catch {
        // ignore if store/module doesn't exist yet
      }
    })()
  }, [lessonId])

  if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
    return <div className="p-8 text-[#475569]">Invalid lesson selected.</div>
  }

  if (isLoading) return <LessonGeneratingState />
  if (isError) return <div className="p-8">Unable to load lesson: {error?.message ?? 'Try again later.'}</div>
  if (!data) return null

  const lesson = data as unknown as Lesson

  if (lesson.generation_status === 'failed') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-red-800">Lesson generation failed</h3>
          <p className="mt-2 text-sm text-red-700">{lesson.error_message ?? 'We could not generate this lesson right now.'}</p>
          <button
            className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={retryLessonMutation.status === 'pending'}
            onClick={() => retryLessonMutation.mutate(lessonId as string)}
          >
            {retryLessonMutation.status === 'pending' ? 'Retrying…' : 'Retry lesson generation'}
          </button>
          {retryLessonMutation.isError && (
            <p className="mt-3 text-sm text-red-700">Retry failed. Please try again.</p>
          )}
        </div>
      </div>
    )
  }

  if (lesson.generation_status !== 'complete') return <LessonGeneratingState />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#475569]">Lesson</h2>
          <MarkCompleteButton lessonId={lesson.id} completed={lesson.completed} />
        </div>

        <LessonContent lesson={lesson} />
      </div>
    </div>
  )
}
