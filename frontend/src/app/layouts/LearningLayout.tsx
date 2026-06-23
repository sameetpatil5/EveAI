import { Outlet, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useLearningStore } from '@/stores/learning.store'
import CourseSidebar from '@/features/course/components/CourseSidebar'
import TutorPanel from '@/features/tutor/components/TutorPanel'

export default function LearningLayout() {
  const params = useParams()
  const setActiveCourseId = useLearningStore((s) => s.setActiveCourseId)
  const clearLearning = useLearningStore((s) => s.clearLearning)

  useEffect(() => {
    setActiveCourseId(params.courseId ?? null)
    return () => clearLearning()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.courseId])

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-[280px_1fr_320px] gap-6">
          <aside className="hidden md:block">
            <CourseSidebar courseId={params.courseId ?? ''} />
          </aside>
          <section className="min-h-[60vh] overflow-y-auto">
            <Outlet />
          </section>
          <aside className="hidden lg:block">
            <TutorPanel />
          </aside>
        </div>
      </div>
    </div>
  )
}
