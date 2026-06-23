import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { getProfile, updateProfile } from './profile.api'

export const useProfileQuery = () =>
  useQuery({ queryKey: ['profile'], queryFn: getProfile })

export const useUpdateProfileMutation = () =>
  useMutation({ mutationFn: updateProfile, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }) })
