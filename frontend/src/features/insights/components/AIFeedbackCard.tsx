import { Card } from '@/components/ui/Card'

export default function AIFeedbackCard({ insights, isLoading }: { insights: string[] | undefined; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="h-3 w-3/4 rounded-full bg-[#e2e8f0] animate-pulse" />
          <div className="h-3 w-full rounded-full bg-[#e2e8f0] animate-pulse" />
          <div className="h-3 w-5/6 rounded-full bg-[#e2e8f0] animate-pulse" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="text-sm font-medium text-[#0f172a] mb-4">AI Report</div>
      <ul className="space-y-3 list-disc pl-5 text-sm text-[#475569]">
        {insights?.map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
      </ul>
    </Card>
  )
}
