import { useMutation } from '@tanstack/react-query'
import { generateModuleQuiz, generateQuickQuiz, submitQuiz } from './quiz.api'

export const useGenerateModuleQuizMutation = () =>
  useMutation({
    mutationFn: ({ moduleId, difficulty, count, prompt }: { moduleId: string; difficulty: string; count: number; prompt?: string }) =>
      generateModuleQuiz(moduleId, difficulty, count, prompt),
  })

export const useGenerateQuickQuizMutation = () =>
  useMutation({
    mutationFn: ({ subjectId, difficulty, count, prompt }: { subjectId?: string; difficulty: string; count: number; prompt?: string }) =>
      generateQuickQuiz(subjectId, difficulty, count, prompt),
  })

export const useSubmitQuizMutation = () =>
  useMutation({ mutationFn: ({ quizId, answers }: { quizId: string; answers: Array<{ question_id: string; answer: string }> }) => submitQuiz(quizId, answers) })
