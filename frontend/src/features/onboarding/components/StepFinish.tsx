import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { completeOnboarding } from '../onboarding.api'
import { useUIStore } from '@/stores/ui.store'

interface StepFinishProps {
  onNext?: () => void
}

export default function StepFinish(_: StepFinishProps) {
  const navigate = useNavigate()
  const setOnboardingJobId = useUIStore((state) => state.setOnboardingJobId)

  const mutation = useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: (data) => {
      setOnboardingJobId(data.job_id)
      navigate('/app/dashboard')
    },
    onError: (error: unknown) => {
      console.error(error)
    },
  })

  return (
    <div className="space-y-6 rounded-3xl border border-[#e9eaf2] bg-white p-8 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-[#0f172a]">Almost there</h2>
        <p className="mt-2 text-sm text-[#64748b]">Review your onboarding choices and start your learning journey.</p>
      </div>

      <div className="space-y-3 rounded-3xl bg-[#f8fafc] p-6 text-sm text-[#475569]">
        <p>This final step completes onboarding and begins the course generation process.</p>
      </div>

      <Button type="button" className="w-full" disabled={mutation.status === 'pending'} onClick={() => mutation.mutate()}>
        {mutation.status === 'pending' ? 'Starting learning…' : 'Start Learning'}
      </Button>
    </div>
  )
}
