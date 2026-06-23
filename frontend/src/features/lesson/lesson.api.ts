import apiClient from '@/lib/apiClient'
import type { Lesson } from './lesson.types'

export const getLesson = (lessonId: string): Promise<Lesson> => apiClient.get(`/lessons/${lessonId}`)

export const markLessonComplete = (lessonId: string): Promise<void> => apiClient.post(`/lessons/${lessonId}/complete`)

export const getNextLesson = (currentLessonId: string): Promise<Lesson | null> => apiClient.get(`/lessons/${currentLessonId}/next`)
