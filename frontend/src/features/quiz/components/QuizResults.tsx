import type { QuizResult } from '../quiz.types'
import { useQuizStore } from '../quiz.store'

export default function QuizResults({ result }: { result: QuizResult }) {
  const reset = useQuizStore((s) => s.reset)
  const pct = Math.round(result.score)
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold">{pct}%</div>
        <div className="text-sm text-[#475569]">{result.passed ? 'Passed' : 'Failed'}</div>
      </div>
      <div>
        <div className="font-medium mb-2">Feedback</div>
        <div className="text-sm text-[#475569]">{result.feedback ?? 'No feedback available.'}</div>
      </div>
      <div>
        <div className="font-medium mb-2">Question Feedback</div>
        <ul className="space-y-2">
          {result.question_results.map((q) => (
            <li key={q.question_id} className="text-sm text-[#475569]">
              {q.question_id}: {q.correct ? 'Correct' : 'Incorrect'}
              {q.feedback ? ` — ${q.feedback}` : q.detail ? ` — ${q.detail}` : q.reason ? ` — ${q.reason}` : ''}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <button className="mt-4 inline-flex items-center rounded-lg bg-[#607afb] px-4 py-2 text-white" onClick={reset}>
          Try Again
        </button>
      </div>
    </div>
  )
}
