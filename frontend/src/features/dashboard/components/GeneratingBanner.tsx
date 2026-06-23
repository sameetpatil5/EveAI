import { useEffect, useState } from 'react'
import { queryClient } from '@/lib/queryClient'
import { useUIStore } from '@/stores/ui.store'
import { useJobStatusQuery } from '../dashboard.queries'
import { Spinner } from '@/components/ui/Spinner'
import apiClient from '@/lib/apiClient'

interface GeneratingBannerProps {
  jobId: string
}

export function GeneratingBanner({ jobId }: GeneratingBannerProps) {
  const setOnboardingJobId = useUIStore((state) => state.setOnboardingJobId)
  const { data, status, error } = useJobStatusQuery(jobId)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (data?.status === 'complete') {
      queryClient.invalidateQueries({ queryKey: ['dashboard-state'] })
      setOnboardingJobId(null)
    }
  }, [data?.status, setOnboardingJobId])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await apiClient.post(`/jobs/${jobId}/retry`)
      // Invalidate and refetch job status
      queryClient.invalidateQueries({ queryKey: ['job', jobId] })
    } catch (err) {
      console.error('Failed to retry job:', err)
    } finally {
      setIsRetrying(false)
    }
  }

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
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
        <div className="mb-3">
          <p className="text-sm font-medium text-red-900">Course generation failed</p>
          <p className="text-sm text-red-700 mt-1">
            {data?.error || 'An error occurred during course generation. Please try again.'}
          </p>
        </div>
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRetrying && <Spinner size="xs" />}
          {isRetrying ? 'Retrying...' : 'Retry course generation'}
        </button>
      </div>
    )
  }

  return null
}
