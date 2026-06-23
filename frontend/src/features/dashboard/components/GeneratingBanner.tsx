import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { useUIStore } from '@/stores/ui.store'
import { useJobStatusQuery } from '../dashboard.queries'
import { Spinner } from '@/components/ui/Spinner'

interface GeneratingBannerProps {
  jobId: string
}

export function GeneratingBanner({ jobId }: GeneratingBannerProps) {
  const setOnboardingJobId = useUIStore((state) => state.setOnboardingJobId)
  const { data, status, error } = useJobStatusQuery(jobId)

  useEffect(() => {
    if (data?.status === 'complete') {
      queryClient.invalidateQueries({ queryKey: ['dashboard-state'] })
      setOnboardingJobId(null)
    }
  }, [data?.status, setOnboardingJobId])

  if (status === 'error') {
    return (
      <div className="rounded-3xl border border-[#e9eaf2] bg-[#fff7ed] p-5 text-sm text-[#92400e]">
        Unable to track generation status: {error?.message ?? 'Please try again later.'}
      </div>
    )
  }

  if (status === 'pending' || data?.status === 'pending' || data?.status === 'running') {
    return (
      <div className="rounded-3xl border border-[#e9eaf2] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <div>
            <p className="text-sm font-medium text-[#0f172a]">Generating your courses…</p>
            <p className="text-sm text-[#64748b]">This may take a few moments. We’ll update your dashboard once finished.</p>
          </div>
        </div>
      </div>
    )
  }

  if (data?.status === 'failed') {
    return (
      <div className="rounded-3xl border border-[#e9eaf2] bg-[#fef2f2] p-5 text-sm text-[#991b1b]">
        Course generation failed. Please try again later.
      </div>
    )
  }

  return null
}
