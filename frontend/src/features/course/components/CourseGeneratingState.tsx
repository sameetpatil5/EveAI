import { Spinner } from '@/components/ui/Spinner'

export function CourseGeneratingState() {
  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto mb-4 max-w-lg">
        <Spinner size="lg" />
      </div>
      <h3 className="text-lg font-semibold text-[#0f172a]">Your course is being generated…</h3>
      <p className="mt-2 text-sm text-[#64748b]">This may take a minute — we’ll notify you when it’s ready.</p>
    </div>
  )
}
