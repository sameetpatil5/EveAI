import { useParams } from 'react-router-dom'
import CourseSidebar from '../components/CourseSidebar'
import { useCourseStructureQuery } from '../course.queries'
import { CourseGeneratingState } from '../components/CourseGeneratingState'

export default function CoursePage() {
  const { courseId } = useParams()
  const { data, status } = useCourseStructureQuery(courseId ?? null)

  if (status === 'pending') return <div className="p-8">Loading course…</div>
  if (status === 'error' || !data) return <div className="p-8">Unable to load course.</div>

  if (data.generation_status !== 'complete') {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <CourseGeneratingState />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <CourseSidebar courseId={data.id} />

        <main>
          <h1 className="text-3xl font-semibold text-[#0f172a]">{data.title}</h1>
          {data.description ? <p className="mt-2 text-sm text-[#64748b]">{data.description}</p> : null}

          <div className="mt-6 space-y-6">
            {data.modules.map((mod) => (
              <div key={mod.id} className="rounded-2xl border border-[#e9eaf2] bg-white p-5">
                <div className="text-lg font-medium text-[#0f172a]">{mod.title}</div>
                <p className="mt-2 text-sm text-[#64748b]">{mod.description}</p>
                <div className="mt-4 space-y-2">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between gap-4 border-b border-[#e9eaf2] py-3 last:border-b-0">
                      <div className="text-sm text-[#0f172a]">{lesson.title}</div>
                      <div className="text-xs text-[#64748b]">{lesson.completed ? 'Completed' : 'Not started'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
