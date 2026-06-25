import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCourseStructureQuery } from '../course.queries'
import { CourseGeneratingState } from '../components/CourseGeneratingState'
import { useLessonQuery, useRetryLessonGenerationMutation } from '@/features/lesson/lesson.queries'
import { LessonContent } from '@/features/lesson/components/LessonContent'
import { MarkCompleteButton } from '@/features/lesson/components/MarkCompleteButton'
import { useLearningStore } from '@/stores/learning.store'

export default function CoursePage() {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const activeLessonId = searchParams.get('lesson')
  const { data, status } = useCourseStructureQuery(courseId ?? null)
  const { data: lessonData, isLoading: isLessonLoading, isError: isLessonError, error: lessonError } = useLessonQuery(activeLessonId)
  const retryLessonMutation = useRetryLessonGenerationMutation()
  const setActiveLessonId = useLearningStore((s) => s.setActiveLessonId)

  useEffect(() => {
    setActiveLessonId(activeLessonId)
  }, [activeLessonId, setActiveLessonId])

  if (status === 'pending') return <div className="p-8">Loading course…</div>
  if (status === 'error' || !data) return <div className="p-8">Unable to load course.</div>

  if (data.generation_status !== 'complete') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <CourseGeneratingState />
      </div>
    )
  }

  const lesson = lessonData

  return (
    <div className="h-full min-h-0 px-4 py-4">
      <main className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e9eaf2] bg-white">
        <div className="h-full min-h-0 overflow-y-auto p-6">
          {activeLessonId ? (
            <div className="space-y-6">
              {isLessonLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="rounded-3xl border border-[#e9eaf2] bg-white p-8 text-center shadow-sm">
                    <div className="animate-pulse text-[#64748b]">Loading lesson…</div>
                  </div>
                </div>
              ) : isLessonError ? (
                <div className="p-8 text-[#475569]">Unable to load lesson: {lessonError?.message ?? 'Try again later.'}</div>
              ) : !lesson ? (
                <div className="p-8 text-[#475569]">Lesson not found.</div>
              ) : lesson.generation_status === 'failed' ? (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-red-800">Lesson generation failed</h3>
                  <p className="mt-2 text-sm text-red-700">{lesson.error_message ?? 'We could not generate this lesson right now.'}</p>
                  <button
                    className="mt-6 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={retryLessonMutation.status === 'pending'}
                    onClick={() => retryLessonMutation.mutate(activeLessonId)}
                  >
                    {retryLessonMutation.status === 'pending' ? 'Retrying…' : 'Retry lesson generation'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold text-[#0f172a]">{lesson.title}</h1>
                      <p className="text-sm text-[#64748b]">Lesson content is shown below.</p>
                    </div>
                    <MarkCompleteButton lessonId={lesson.id} completed={lesson.completed} />
                  </div>
                  <LessonContent lesson={lesson} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center text-[#64748b]">
              <div className="rounded-3xl border border-dashed border-[#e9eaf2] bg-[#f8fafc] p-10">
                <p className="text-lg font-semibold text-[#0f172a]">Select a lesson to begin</p>
                <p className="mt-2 text-sm">Your course structure is available on the left. The lesson content and AI tutor will appear once you choose one.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
