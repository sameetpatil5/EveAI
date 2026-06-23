import apiClient from '@/lib/apiClient'
import type { Profile, TimeSlot } from './profile.types'

export const getProfile = (): Promise<Profile> => apiClient.get('/profile')

export const updateProfile = (data: Partial<{
  full_name: string
  academic_level: string
  major: string
  available_time_slots: TimeSlot[]
  hobbies: string[]
  subjects: Array<{ id: string; priority?: number; weekly_hours?: number; goal?: string }>
}>): Promise<void> => apiClient.put('/profile', data)
