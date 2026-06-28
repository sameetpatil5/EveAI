import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const navigate = useNavigate()

  return (
    <Card className={`rounded-3xl p-6 flex flex-col justify-between ${className ?? ''}`}>
      <div className="-mt-2 mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Quick Actions</div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => navigate('/app/quick-ask')} className="rounded-md bg-[#607afb] py-2 text-xs font-semibold text-white">Ask</button>
        <button onClick={() => navigate('/app/quick-quiz')} className="rounded-md bg-[#10b981] py-2 text-xs font-semibold text-white">Quiz</button>
      </div>
    </Card>
  )
}
