interface LessonHeaderProps {
  title: string
  completed: boolean
}

export function LessonHeader({ title, completed }: LessonHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[#0f172a]">{title}</h1>
      {completed ? (
        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">Completed ✓</div>
      ) : null}
    </div>
  )
}
