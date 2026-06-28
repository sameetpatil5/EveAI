import { useEffect } from 'react'
import type { QuizResult } from '../quiz.types'
import { useNavigate, useParams } from 'react-router-dom'
import { useGenerateModuleQuizMutation, useSubmitQuizMutation } from '../quiz.queries'
import { useQuizStore } from '../quiz.store'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ModuleQuizPage() {
  const params = useParams()
  const quizId = params.quizId ?? params.moduleId ?? ''
  const navigate = useNavigate()
  const genMut = useGenerateModuleQuizMutation()
  const submitMut = useSubmitQuizMutation()
  const setQuestions = useQuizStore((s) => s.setQuestions)
  const questions = useQuizStore((s) => s.questions)
  const answers = useQuizStore((s) => s.answers)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const result = useQuizStore((s) => s.result)
  const submitted = useQuizStore((s) => s.submitted)

  const isGenerating = genMut.isPending

  useEffect(() => {
    if (!quizId || questions.length > 0) return

    genMut.mutate(
      { moduleId: quizId, difficulty: 'medium', count: 5, prompt: 'Focus on the core concepts from this module and include a mix of conceptual and application-based questions.' },
      {
        onSuccess: (data) => {
          setQuestions(data.questions)
        },
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, questions.length])

  const answeredCount = Object.values(answers).filter(Boolean).length
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const handleSubmit = () => {
    if (!questions.length) return
    const payload = Object.keys(answers).map((qid) => ({ question_id: qid, answer: answers[qid] }))
    submitMut.mutate(
      { quizId, answers: payload },
      {
        onSuccess: (res) => {
          useQuizStore.getState().setResult(res)
        },
      },
    )
  }

  if (isGenerating) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8 text-center">
          <Spinner size="lg" className="mx-auto text-[#607afb]" />
          <p className="mt-4 text-sm text-[#64748b]">Loading your quiz... please wait.</p>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#0f172a]">Quiz Results</h1>
              <p className="mt-2 text-sm text-[#64748b]">Review your score and feedback below.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate('/app/quick-quiz')}>
              Back to Quick Quiz
            </Button>
          </div>
          <QuizResults result={result} />
        </Card>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-semibold text-[#0f172a]">Quiz not loaded</h1>
            <p className="text-sm text-[#64748b]">
              No quiz content is currently available. Generate a quick quiz first, or return to the quiz selection page.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button type="button" onClick={() => navigate('/app/quick-quiz')}>
                Go to Quick Quiz
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/app/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Card className="overflow-hidden border-[#e9eaf2] bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]">
          <div className="border-b border-[#e9eaf2] bg-[#f8fafc] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Take Quiz</h1>
                <p className="mt-1 text-sm text-slate-500">Answer each question and submit to review your score.</p>
              </div>
              <div className="rounded-full bg-[#607afb]/10 px-3 py-1 text-sm font-medium text-[#607afb]">
                {answeredCount}/{questions.length} answered
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {questions.map((q) => {
              const questionResult = (result as QuizResult | null)?.question_results.find(
                (r) => r.question_id === q.id,
              )
              return (
                <QuizQuestion
                  key={q.id}
                  question={q}
                  answer={answers[q.id]}
                  onAnswer={(a) => setAnswer(q.id, a)}
                  submitted={submitted}
                  result={questionResult}
                />
              )
            })}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" disabled={!allAnswered || submitMut.isPending} onClick={handleSubmit}>
                {submitMut.isPending ? 'Submitting...' : 'Submit Quiz'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/app/quick-quiz')}>
                Back to Quick Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
