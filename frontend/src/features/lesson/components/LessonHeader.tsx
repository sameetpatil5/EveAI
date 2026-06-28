import { Check } from 'lucide-react'

interface LessonHeaderProps {
  title: string
  completed: boolean
}

export function LessonHeader({ title, completed }: LessonHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[#0f172a]">{title}</h1>
      {completed ? (
        <div className="flex items-center justify-center rounded-full bg-green-100 p-1 text-green-700">
          <Check size={16} />
        </div>
      ) : null}
    </div>
  )
}
