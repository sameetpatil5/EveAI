import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSubmitQuizMutation } from '../quiz.queries'
import { useQuizStore } from '../quiz.store'
import type { QuizResult } from '../quiz.types'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function TakeQuizPage() {
  const params = useParams()
  const quizId = params.quizId ?? ''
  const navigate = useNavigate()
  const submitMut = useSubmitQuizMutation()
  const questions = useQuizStore((s) => s.questions)
  const answers = useQuizStore((s) => s.answers)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const result = useQuizStore((s) => s.result) as QuizResult | null
  const submitted = useQuizStore((s) => s.submitted)

  const answeredCount = useMemo(() => Object.values(answers).filter(Boolean).length, [answers])
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const handleSubmit = () => {
    if (!questions.length) return
    const payload = Object.keys(answers).map((qid) => ({ question_id: qid, answer: answers[qid] }))
    submitMut.mutate({ quizId, answers: payload }, {
      onSuccess: (res) => {
        useQuizStore.getState().setResult(res)
      },
    })
  }

  if (submitMut.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-2">
        <Card className="p-6 text-center">
          <Spinner size="lg" className="mx-auto text-[#607afb]" />
          <p className="mt-4 text-sm text-[#64748b]">Submitting your answers...</p>
        </Card>
      </div>
    )
  }

  if (result) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-2">
        <Card className="p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#0f172a]">Quiz Results</h1>
              <p className="mt-2 text-sm text-[#64748b]">Great work. Review your score and feedback below.</p>
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
      <div className="mx-auto w-full max-w-6xl px-4 py-2">
        <Card className="p-6">
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-semibold text-[#0f172a]">No active quiz</h1>
            <p className="text-sm text-[#64748b]">
              We couldn't find a loaded quiz for this session. Please generate a quick quiz first.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate('/app/quick-quiz')}>Go to Quick Quiz</Button>
              <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
        <Card className="overflow-hidden border-[#e9eaf2] bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]">
          <div className="border-b border-[#e9eaf2] bg-[#f8fafc] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Take Quiz</h1>
                <p className="mt-1 text-sm text-slate-500">Answer each question and submit to see your results.</p>
              </div>
              <div className="rounded-full bg-[#607afb]/10 px-3 py-1 text-sm font-medium text-[#607afb]">
                {answeredCount}/{questions.length} answered
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="space-y-6">
            {questions.map((question) => {
              const questionResult = (result as QuizResult | null)?.question_results.find(
                (r: { question_id: string }) => r.question_id === question.id,
              )
              return (
                <QuizQuestion
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  onAnswer={(value) => setAnswer(question.id, value)}
                  submitted={submitted}
                  result={questionResult}
                />
              )
            })}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" disabled={!allAnswered || submitMut.isPending} onClick={handleSubmit}>
                Submit Quiz
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
