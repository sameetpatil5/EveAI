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
    <div className="h-full min-h-0 flex flex-1 flex-col bg-[#f8f9fc] overflow-hidden">
      {/* <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-2"></div>
        <div className="grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)_320px] gap-4"> */}
      <div className="flex h-full min-h-0 w-full flex-1 flex-col px-2 py-2">
        <div className="grid h-full min-h-0 grid-cols-[280px_minmax(0,1fr)_320px] gap-4 px-4">
          <aside className="hidden md:flex h-full min-h-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e9eaf2] bg-white">
              <CourseSidebar courseId={params.courseId ?? ''} />
            </div>
          </aside>
          <section className="h-full min-h-0 overflow-hidden">
            <div className="h-full min-h-0 overflow-hidden rounded-3xl border border-[#e9eaf2] bg-white">
              <div className="h-full min-h-0 overflow-y-auto">
                <Outlet />
              </div>
            </div>
          </section>
          <aside className="hidden lg:flex h-full min-h-0">
            <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-[#e9eaf2] bg-white">
              <TutorPanel />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
