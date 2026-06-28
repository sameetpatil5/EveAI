import type { QuizResult } from '../quiz.types'
import { useQuizStore } from '../quiz.store'

export default function QuizResults({ result }: { result: QuizResult }) {
  const reset = useQuizStore((s) => s.reset)
  const questions = useQuizStore((s) => s.questions)
  const answers = useQuizStore((s) => s.answers)
  const pct = Math.round(result.score)

  const hasGeneralFeedback = Boolean(result.feedback?.trim())
  const hasQuestionFeedback = result.question_results.length > 0

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] p-5 text-center">
        <div className="text-4xl font-bold text-slate-900">{pct}%</div>
        <div className="mt-1 text-sm font-medium text-slate-500">{result.passed ? 'Passed' : 'Failed'}</div>
      </div>

      {hasGeneralFeedback && (
        <div className="rounded-2xl border border-[#e9eaf2] bg-white p-5">
          <div className="mb-2 font-medium text-slate-800">Feedback</div>
          <div className="text-sm text-slate-600">{result.feedback}</div>
        </div>
      )}

      {hasQuestionFeedback && (
        <div className="rounded-2xl border border-[#e9eaf2] bg-white p-5 max-h-[50vh] overflow-y-auto">
          <div className="mb-3 font-medium text-slate-800">Question Review</div>
          <ul className="space-y-4">
            {result.question_results.map((q) => {
              const question = questions.find((item) => item.id === q.question_id)
              const userAnswer = answers[q.question_id] ?? 'Not answered'
              const relevantAnswer = question?.correct_answer || q.reason || q.detail || q.feedback || 'Not available'
              const feedbackText = q.feedback || q.detail || q.reason || ''

              return (
                <li key={q.question_id} className="rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] p-4">
                  <div className="text-sm font-medium text-slate-800">{question?.question_text || 'Question'}</div>
                  <div className="mt-2 space-y-2 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-700">Your answer:</span> {userAnswer}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Relevant answer:</span> {relevantAnswer}
                    </div>
                    {feedbackText && (
                      <div>
                        <span className="font-medium text-slate-700">Feedback:</span> {feedbackText}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div>
        <button className="mt-2 inline-flex items-center rounded-2xl bg-[#607afb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f6df5]" onClick={reset}>
          Try Again
        </button>
      </div>
    </div>
  )
}
