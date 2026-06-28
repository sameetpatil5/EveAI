import { Card } from '@/components/ui/Card'

export default function ProgressChart() {
  return (
    <Card className="rounded-3xl p-6 flex flex-col h-full">
      <div className="mb-6 text-sm font-medium text-[#475569]">Weekly Study Hours</div>
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {/* [Graph placeholder - will be replaced with actual chart] */}
        <div className="text-center text-[#94a3b8]">
          <div className="text-sm">[Graph visualization coming soon]</div>
        </div>
      </div>
    </Card>
  )
}
