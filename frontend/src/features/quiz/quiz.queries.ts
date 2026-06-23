import { useMutation } from '@tanstack/react-query'
import { generateModuleQuiz, generateQuickQuiz, submitQuiz } from './quiz.api'

export const useGenerateModuleQuizMutation = () =>
  useMutation({ mutationFn: ({ moduleId, difficulty, count }: { moduleId: string; difficulty: string; count: number }) => generateModuleQuiz(moduleId, difficulty, count) })

export const useGenerateQuickQuizMutation = () =>
  useMutation({ mutationFn: ({ subjectId, difficulty, count }: { subjectId?: string; difficulty: string; count: number }) => generateQuickQuiz(subjectId, difficulty, count) })

export const useSubmitQuizMutation = () =>
  useMutation({ mutationFn: ({ quizId, answers }: { quizId: string; answers: Array<{ question_id: string; answer: string }> }) => submitQuiz(quizId, answers) })
