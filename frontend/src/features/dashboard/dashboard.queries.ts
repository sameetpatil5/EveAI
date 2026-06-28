import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { getDashboardState } from './dashboard.api'
import type { DashboardState } from './dashboard.types'

interface JobStatusResponse {
  status: string
  message?: string
  error?: string | null
}

export const useDashboardStateQuery = () =>
  useQuery<DashboardState, Error>({
    queryKey: ['dashboard-state'],
    queryFn: getDashboardState,
  })

export const useJobStatusQuery = (jobId: string | null) =>
  useQuery<JobStatusResponse, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const response = await apiClient.get(`/jobs/${jobId as string}`)
      return response as unknown as JobStatusResponse
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.status === 'complete' || data.status === 'failed') return false
      return 5000
    },
  })