import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/apiClient'
import { getDashboardState } from './dashboard.api'
import type { DashboardState } from './dashboard.types'

export const useDashboardStateQuery = () =>
  useQuery<DashboardState, Error>({
    queryKey: ['dashboard-state'],
    queryFn: getDashboardState,
  })

export const useJobStatusQuery = (jobId: string | null) =>
  useQuery<{ status: string; message?: string }, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await apiClient.get(`/jobs/${jobId as string}`)
      return res.data
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return false
      if (data.status === 'complete' || data.status === 'failed') return false
      return 5000
    },
  })