import { Card } from '@/components/ui/Card'

export default function AIFeedbackCard({ insights, isLoading }: { insights: string[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card className="rounded-3xl p-6 flex flex-col h-full">
        <div className="mb-6 text-sm font-medium text-[#475569]">AI Report</div>
        <div className="flex-1 space-y-3">
          <div className="h-3 w-3/4 rounded-full bg-[#e2e8f0] animate-pulse" />
          <div className="h-3 w-full rounded-full bg-[#e2e8f0] animate-pulse" />
          <div className="h-3 w-5/6 rounded-full bg-[#e2e8f0] animate-pulse" />
          <div className="h-3 w-4/5 rounded-full bg-[#e2e8f0] animate-pulse" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl p-6 flex flex-col h-full">
      <div className="text-sm font-medium text-[#475569] mb-6">AI Report</div>
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {!insights || insights.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4 text-sm text-[#64748b]">
            No insights available yet.
          </div>
        ) : (
          <ul className="space-y-3 list-disc pl-5 text-sm text-[#475569]">
            {insights.map((insight, index) => (
              <li key={index} className="leading-6">
                {insight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
