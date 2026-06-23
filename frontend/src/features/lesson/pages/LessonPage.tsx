import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useLessonQuery } from '../lesson.queries'
import { LessonGeneratingState } from '../components/LessonGeneratingState'
import { LessonContent } from '../components/LessonContent'
import { MarkCompleteButton } from '../components/MarkCompleteButton'

export default function LessonPage() {
  const { lessonId } = useParams()

  if (!lessonId || lessonId === 'null' || lessonId === 'undefined') {
    return <div className="p-8 text-[#475569]">Invalid lesson selected.</div>
  }

  const { data, status, error } = useLessonQuery(lessonId)

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

  if (status === 'pending') return <LessonGeneratingState />
  if (status === 'error') return <div className="p-8">Unable to load lesson: {error?.message ?? 'Try again later.'}</div>
  if (!data) return null

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
