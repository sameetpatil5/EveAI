import { useQuery, useMutation } from '@tanstack/react-query'
import { getSchedule, updateEntryStatus, regenerateSchedule } from './schedule.api'
import { queryClient } from '@/lib/queryClient'

export const useScheduleQuery = () => useQuery({ queryKey: ['schedule'], queryFn: () => getSchedule() })

export const useUpdateStatusMutation = () =>
  useMutation({ mutationFn: ({ entryId, status }: { entryId: string; status: string }) => updateEntryStatus(entryId, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }) })

export const useRegenerateScheduleMutation = () =>
  useMutation({ mutationFn: (feedback: string) => regenerateSchedule(feedback), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedule'] }) })
