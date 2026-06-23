import apiClient from '@/lib/apiClient'
import type { Insights, AIInsights } from './insights.types'

export const getInsights = (): Promise<Insights> =>
  apiClient.get('/dashboard')

export const getAIReport = (): Promise<AIInsights> =>
  apiClient.get('/insights/ai-report')
