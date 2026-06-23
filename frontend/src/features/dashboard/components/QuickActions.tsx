import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card className="p-5">
      <div className="mb-5 text-sm font-medium text-[#475569]">Quick actions</div>
      <div className="space-y-3">
        <Button variant="secondary" className="w-full" onClick={() => navigate('/app/notes')}>
          Quick Ask
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => navigate('/app/quick-quiz')}>
          Quick Quiz
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => navigate('/app/subjects')}>
          Browse Subjects
        </Button>
      </div>
    </Card>
  )
}
