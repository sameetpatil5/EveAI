import type { QuizQuestion } from '../quiz.types'
import MCQOption from './MCQOption'
import SubjectiveInput from './SubjectiveInput'

export default function QuizQuestion({
  question,
  answer,
  onAnswer,
  submitted,
  result
}: {
  question: QuizQuestion
  answer: string | undefined
  onAnswer: (a: string) => void
  submitted: boolean
  result?: { correct: boolean; feedback?: string }
}) {
  return (
    <div className="mb-6">
      <div className="mb-3 text-sm font-medium text-[#0f172a]">{question.question_text}</div>
      <div className="space-y-3">
        {question.question_type === 'mcq' && (
          <div className="grid grid-cols-1 gap-3">
            {(question.options || []).map((opt) => (
              <MCQOption
                key={opt}
                option={opt}
                selected={answer === opt}
                correct={submitted ? result?.correct : undefined}
                onClick={() => onAnswer(opt)}
              />
            ))}
          </div>
        )}

        {question.question_type === 'truefalse' && (
          <div className="flex gap-3">
            {['True', 'False'].map((opt) => (
              <MCQOption key={opt} option={opt} selected={answer === opt} onClick={() => onAnswer(opt)} />
            ))}
          </div>
        )}

        {question.question_type === 'subjective' && (
          <SubjectiveInput value={answer ?? ''} onChange={onAnswer} disabled={submitted} />
        )}

        {submitted && result?.feedback && <div className="text-sm text-[#475569]">{result.feedback}</div>}
      </div>
    </div>
  )
}
