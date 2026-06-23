import { Spinner } from '@/components/ui/Spinner'

export function LessonGeneratingState() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="rounded-3xl border border-[#e9eaf2] bg-white p-8 text-center shadow-sm">
        <Spinner size="lg" />
        <h3 className="mt-4 text-lg font-semibold text-[#0f172a]">Generating your personalized lesson…</h3>
        <p className="mt-2 text-sm text-[#64748b]">This may take a few seconds.</p>
      </div>
    </div>
  )
}
