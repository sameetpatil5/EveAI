import apiClient from '@/lib/apiClient'
import type { TutorChatResponse } from './tutor.types'

export const tutorChat = (message: string, lessonId: string, sessionId?: string): Promise<TutorChatResponse> =>
  apiClient.post('/ai/tutor/chat', { message, lesson_id: lessonId, session_id: sessionId })

export const quickAsk = (message: string, subjectId?: string): Promise<{ response: string; references: any[] }> =>
  apiClient.post('/ai/quick-ask', { message, subject_id: subjectId })
