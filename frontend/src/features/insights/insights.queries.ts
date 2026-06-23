import { useQuery } from '@tanstack/react-query'
import { getInsights, getAIReport } from './insights.api'

export const useInsightsQuery = () =>
  useQuery({ queryKey: ['insights'], queryFn: getInsights })

export const useAIReportQuery = () =>
  useQuery({ queryKey: ['ai-report'], queryFn: getAIReport, staleTime: 10 * 60 * 1000 })
