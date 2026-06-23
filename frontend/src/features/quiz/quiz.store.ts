import { create } from 'zustand'
import type { QuizQuestion, QuizResult } from './quiz.types'

interface QuizState {
  questions: QuizQuestion[]
  answers: Record<string, string>
  submitted: boolean
  result: QuizResult | null
  setQuestions: (questions: QuizQuestion[]) => void
  setAnswer: (questionId: string, answer: string) => void
  setResult: (result: QuizResult) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set) => ({
  questions: [],
  answers: {},
  submitted: false,
  result: null,
  setQuestions: (questions) => set({ questions, answers: {}, submitted: false, result: null }),
  setAnswer: (questionId, answer) => set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),
  setResult: (result) => set({ result, submitted: true }),
  reset: () => set({ questions: [], answers: {}, submitted: false, result: null })
}))
