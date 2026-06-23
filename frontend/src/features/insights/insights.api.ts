import apiClient from '@/lib/apiClient'
import type { DashboardInsights, AIInsights } from './insights.types'

export const getDashboardInsights = (): Promise<DashboardInsights> =>
  apiClient.get('/insights/dashboard')

export const getAIReport = (): Promise<AIInsights> =>
  apiClient.get('/insights/ai-report')
