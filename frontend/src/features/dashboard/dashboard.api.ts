import apiClient from '@/lib/apiClient'
import type { DashboardState } from './dashboard.types'

export const getDashboardState = (): Promise<DashboardState> =>
  apiClient.get('/state')
