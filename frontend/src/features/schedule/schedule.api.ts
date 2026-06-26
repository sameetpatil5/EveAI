import apiClient from '@/lib/apiClient'
import type { ScheduleResponse } from './schedule.types'

export const getSchedule = (): Promise<ScheduleResponse> => apiClient.get('/schedule')

export const updateEntryStatus = (entryId: string, status: string): Promise<void> =>
  apiClient.patch(`/schedule/${entryId}/status`, { status })

export const regenerateSchedule = (feedback: string): Promise<void> => apiClient.post('/schedule/regenerate', { feedback })
