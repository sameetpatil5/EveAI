import apiClient from '@/lib/apiClient'
import type { AcademicInfo, SubjectInput, AvailabilityRequest } from './onboarding.types'

export const saveAcademic = (data: AcademicInfo): Promise<{ saved: boolean }> =>
  apiClient.post('/onboarding/academic', data)

export const saveSubjects = (subjects: SubjectInput[]): Promise<{ subjects_saved: number }> =>
  apiClient.post('/onboarding/subjects', { subjects })

export const saveHobbies = (hobbies: string[]): Promise<{ hobbies_saved: number }> =>
  apiClient.post('/onboarding/hobbies', { hobbies })

export const saveAvailability = (available_time_slots: AvailabilityRequest): Promise<{ saved: boolean }> =>
  apiClient.post('/onboarding/availability', available_time_slots) 

export const completeOnboarding = (): Promise<{ job_id: string; message: string }> =>
  apiClient.post('/onboarding/complete')
