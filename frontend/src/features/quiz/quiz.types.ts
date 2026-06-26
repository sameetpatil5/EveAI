export interface QuizQuestion {
  id: string
  question_text: string
  question_type: 'mcq' | 'true_false' | 'subjective'
  options?: string[]
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
}

export interface QuizResult {
  quiz_id: string
  score: number
  passed: boolean
  feedback?: string
  question_results: Array<{
    question_id: string
    correct: boolean
    feedback?: string
    detail?: string
    reason?: string
  }>
}
