import { Check, Lock } from 'lucide-react'
import type { LessonMeta } from '../course.types'

interface LessonItemProps {
  lesson: LessonMeta
  locked?: boolean
  active?: boolean
  onClick?: () => void
}

export function LessonItem({ lesson, locked = false, active = false, onClick }: LessonItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={locked}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition ${active ? 'bg-[#eef2ff] text-[#0f172a]' : 'hover:bg-slate-50'} disabled:opacity-60`}
    >
      <div>
        <div className="text-sm font-medium text-[#0f172a]">{lesson.title}</div>
        <div className="text-xs text-[#64748b]">Lesson {lesson.lesson_order}</div>
      </div>
      <div className="flex items-center gap-3">
        {lesson.completed ? (
          <div className="flex items-center justify-center rounded-full bg-green-100 p-1 text-green-700">
            <Check size={14} />
          </div>
        ) : null}
        {locked ? <Lock size={16} className="text-[#64748b]" /> : null}
      </div>
    </button>
  )
}
