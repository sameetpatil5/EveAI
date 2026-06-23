import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Module as ModuleType } from '../course.types'
import { LessonItem } from './LessonItem'

interface ModuleSectionProps {
  module: ModuleType
  onLessonClick?: (lessonId: string) => void
}

export function ModuleSection({ module, onLessonClick }: ModuleSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-slate-50"
      >
        <div>
          <div className="text-sm font-medium text-[#0f172a]">{module.title}</div>
          {module.description ? <div className="text-xs text-[#64748b]">{module.description}</div> : null}
        </div>
        <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="space-y-1 pl-2">
          {module.lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              locked={module.is_locked}
              onClick={() => onLessonClick?.(lesson.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
