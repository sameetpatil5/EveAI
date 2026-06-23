import { useEffect, useState } from 'react'
import type { QuizResult } from '../quiz.types'
import { useParams } from 'react-router-dom'
import { useGenerateModuleQuizMutation, useSubmitQuizMutation } from '../quiz.queries'
import { useQuizStore } from '../quiz.store'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'
import { Spinner } from '@/components/ui/Spinner'

export default function ModuleQuizPage() {
  const params = useParams()
  const moduleId = params.quizId ?? params.moduleId ?? ''
  const genMut = useGenerateModuleQuizMutation()
  const submitMut = useSubmitQuizMutation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setQuestions = useQuizStore((s) => s.setQuestions)
  const questions = useQuizStore((s) => s.questions)
  const answers = useQuizStore((s) => s.answers)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const result = useQuizStore((s) => s.result)
  const submitted = useQuizStore((s) => s.submitted)

  useEffect(() => {
    if (!moduleId) return
    setIsGenerating(true)
    genMut.mutate(
      { moduleId, difficulty: 'medium', count: 5 },
      {
        onSuccess: (data) => {
          setQuestions(data.questions)
        },
        onSettled: () => setIsGenerating(false),
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId])

  const allAnswered = questions.length > 0 && questions.every((q) => !!answers[q.id])

  const handleSubmit = () => {
    if (!questions.length) return
    const payload = Object.keys(answers).map((qid) => ({ question_id: qid, answer: answers[qid] }))
    setIsSubmitting(true)
    submitMut.mutate(
      { quizId: moduleId, answers: payload },
      {
        onSuccess: (res) => {
          useQuizStore.getState().setResult(res)
        },
        onSettled: () => setIsSubmitting(false),
      },
    )
  }

  if (isGenerating) return <div className="p-6"><Spinner /></div>

  if (result) return <QuizResults result={result} />

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Module Quiz</h2>
      {questions.map((q) => (
        <QuizQuestion
          key={q.id}
          question={q}
          answer={answers[q.id]}
          onAnswer={(a) => setAnswer(q.id, a)}
          submitted={submitted}
          result={(result as QuizResult | null)?.question_results?.find((r: any) => r.question_id === q.id)}
        />
      ))}
      <div className="mt-4">
        <button className="rounded-lg bg-[#607afb] px-4 py-2 text-white disabled:opacity-60" disabled={!allAnswered || isSubmitting} onClick={handleSubmit}>
          Submit Quiz
        </button>
      </div>
    </div>
  )
}
