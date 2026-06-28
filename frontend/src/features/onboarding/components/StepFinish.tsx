import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { completeOnboarding } from '../onboarding.api'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { queryClient } from '@/lib/queryClient'
import apiClient from '@/lib/apiClient'

interface JobStatusResponse {
  status: string
  message?: string
  error?: string | null
}

interface StepFinishProps {
  onNext?: () => void
}

export default function StepFinish({}: StepFinishProps) {
  const navigate = useNavigate()
  const setOnboardingJobId = useUIStore((state) => state.setOnboardingJobId)
  const updateUser = useAuthStore((state) => state.updateUser)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () => completeOnboarding(),
    onSuccess: (data) => {
      updateUser({ onboarding_complete: true })
      setOnboardingJobId(data.job_id)
      setJobId(data.job_id)
      setIsProcessing(true)
      setErrorMessage('')
    },
    onError: (error: unknown) => {
      setIsProcessing(false)
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start onboarding setup.')
      console.error(error)
    },
  })

  const { data: jobData } = useQuery<JobStatusResponse, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${jobId}`)
      return response as unknown as JobStatusResponse
    },
    enabled: !!jobId && isProcessing,
    refetchInterval: (query) => {
      const data = query.state.data as { status?: string } | undefined
      if (!data) return 5000
      if (data.status === 'complete' || data.status === 'failed') return false
      return 5000
    },
  })

  useEffect(() => {
    if (!isProcessing || !jobData) return

    if (jobData.status === 'complete') {
      updateUser({ onboarding_complete: true })
      queryClient.invalidateQueries({ queryKey: ['dashboard-state'] })
      setOnboardingJobId(null)
      navigate('/app/dashboard')
      return
    }
  }, [isProcessing, jobData, navigate, setOnboardingJobId, updateUser])

  return (
    <div className="relative">
      <div className="space-y-6 rounded-[32px] border border-[#e9eaf2] bg-white p-8 shadow-sm">
        <div className="rounded-[24px] border border-[#e9eaf2] bg-[#f8fafc] p-5 sm:p-6">
          <div className="inline-flex rounded-full border border-[#dbe4ff] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#607afb]">
            Final step
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#0f172a]">Almost there</h2>
          <p className="mt-2 text-sm leading-6 text-[#64748b]">
            Review your choices and start the setup process. We’ll keep you updated until your courses and schedule are ready.
          </p>
        </div>

        <div className="space-y-3 rounded-[24px] border border-[#e9eaf2] bg-[#f8fafc] p-6 text-sm text-[#475569]">
          <p>This final step completes onboarding and starts the background setup for your courses and schedule.</p>
        </div>

        {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991b1b]">{errorMessage}</p> : null}

        <Button type="button" className="w-full" disabled={mutation.status === 'pending' || isProcessing} onClick={() => mutation.mutate()}>
          {mutation.status === 'pending' || isProcessing ? 'Preparing everything…' : 'Start Learning'}
        </Button>
      </div>

      {isProcessing ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[32px] bg-white/90 px-6 py-8 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-[#e9eaf2] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)]">
            <div className="flex justify-center">
              <Spinner size="lg" />
            </div>
            <h3 className="mt-5 text-center text-lg font-semibold text-[#0f172a]">Finishing your setup</h3>
            <p className="mt-2 text-center text-sm leading-6 text-[#64748b]">
              We’re generating your courses and schedule in the background. This usually takes a little while.
            </p>
            <div className="mt-5 rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-center text-sm text-[#475569]">
              Please keep this page open while we finish.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
