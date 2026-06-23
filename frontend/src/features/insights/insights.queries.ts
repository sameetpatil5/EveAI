import { useQuery } from '@tanstack/react-query'
import { getDashboardInsights, getAIReport } from './insights.api'

export const useDashboardInsightsQuery = () =>
  useQuery({ queryKey: ['insights'], queryFn: getDashboardInsights })

export const useAIReportQuery = () =>
  useQuery({ queryKey: ['ai-report'], queryFn: getAIReport, staleTime: 10 * 60 * 1000 })
