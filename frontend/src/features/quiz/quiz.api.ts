import apiClient from '@/lib/apiClient'
import type { Quiz, QuizResult } from './quiz.types'

export const generateModuleQuiz = (
  moduleId: string,
  difficulty: string,
  count: number,
  prompt?: string,
): Promise<Quiz> =>
  apiClient.post('/quiz/generate/module', { module_id: moduleId, difficulty, question_count: count, prompt })

export const generateQuickQuiz = (
  subjectId: string | undefined,
  difficulty: string,
  count: number,
  prompt?: string,
): Promise<Quiz> =>
  apiClient.post('/quiz/generate/quick', { subject_id: subjectId, difficulty, question_count: count, prompt })

export const submitQuiz = (quizId: string, answers: Array<{ question_id: string; answer: string }>): Promise<QuizResult> =>
  apiClient.post(`/quiz/${quizId}/submit`, { answers })

export const getQuizHistory = (): Promise<any[]> => apiClient.get('/quiz/history')
