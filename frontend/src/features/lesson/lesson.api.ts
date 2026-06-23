import apiClient from '@/lib/apiClient'
import type { Lesson } from './lesson.types'

export const getLesson = (lessonId: string): Promise<Lesson> => apiClient.get(`/lessons/${lessonId}`)

export const retryLessonGeneration = (lessonId: string): Promise<{ status: string }> =>
  apiClient.post(`/lessons/${lessonId}/retry`)

export const markLessonComplete = (lessonId: string): Promise<void> =>
  apiClient.post(`/lessons/${lessonId}/complete`)

export const getNextLesson = (currentLessonId: string): Promise<Lesson | null> =>
  apiClient.get(`/lessons/${currentLessonId}/next`)
