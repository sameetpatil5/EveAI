import { Flame } from 'lucide-react'

export default function StreakDisplay({ current, longest }: { current: number; longest: number }) {
  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4f63df]">
          <Flame size={24} />
        </div>
        <div>
          <div className="text-sm text-[#64748b]">Current streak</div>
          <div className="text-3xl font-semibold text-[#0f172a]">{current} days</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-[#475569]">Longest streak: {longest} days</div>
    </div>
  )
}
