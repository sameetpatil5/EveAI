import { Spinner } from '@/components/ui/Spinner'

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc] px-4 py-10">
      <div className="space-y-4 rounded-3xl bg-white px-8 py-10 text-center shadow-sm">
        <Spinner size="lg" />
        <div className="text-sm font-medium text-[#475569]">Loading... please wait</div>
      </div>
    </div>
  )
}
