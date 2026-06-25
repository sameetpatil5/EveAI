import { useSearchParams } from 'react-router-dom'
import { useCourseStructureQuery } from '../course.queries'
import { ModuleSection } from './ModuleSection'
import { CourseGeneratingState } from './CourseGeneratingState'

interface CourseSidebarProps {
  courseId: string
}

export default function CourseSidebar({ courseId }: CourseSidebarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeLessonId = searchParams.get('lesson')
  const { data, status } = useCourseStructureQuery(courseId)

  if (!courseId) {
    return null
  }

  if (status === 'pending') {
    return <div className="p-4">Loading course…</div>
  }

  if (status === 'error' || !data) {
    return <div className="p-4">Unable to load course.</div>
  }

  if (data.generation_status !== 'complete') {
    return <CourseGeneratingState />
  }

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="h-full min-h-0 overflow-y-auto space-y-4 p-4">
        <div className="rounded-3xl border border-[#e9eaf2] bg-white p-4 shadow-sm">
          <div className="text-sm font-medium text-[#475569]">{data.title}</div>
          <div className="text-xs text-[#64748b]">{data.modules.length} modules</div>
        </div>

        <div className="space-y-3">
          {data.modules.map((mod) => (
            <ModuleSection
              key={mod.id}
              module={mod}
              activeLessonId={activeLessonId ?? undefined}
              onLessonClick={(lessonId) => {
                const nextParams = new URLSearchParams(searchParams)
                nextParams.set('lesson', lessonId)
                setSearchParams(nextParams)
              }}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
