import { useNavigate } from 'react-router-dom'
import { useCourseStructureQuery } from '../course.queries'
import { ModuleSection } from './ModuleSection'
import { CourseGeneratingState } from './CourseGeneratingState'

interface CourseSidebarProps {
  courseId: string
}

export default function CourseSidebar({ courseId }: CourseSidebarProps) {
  const navigate = useNavigate()
  const { data, status } = useCourseStructureQuery(courseId)

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
    <aside className="w-full max-w-xs space-y-4">
      <div className="rounded-3xl border border-[#e9eaf2] bg-white p-4">
        <div className="text-sm font-medium text-[#475569]">{data.title}</div>
        <div className="text-xs text-[#64748b]">{data.modules.length} modules</div>
      </div>

      <div className="space-y-3">
        {data.modules.map((mod) => (
          <ModuleSection key={mod.id} module={mod} onLessonClick={(lessonId) => navigate(`/app/lesson/${lessonId}`)} />
        ))}
      </div>
    </aside>
  )
}
