import { useState } from 'react'
import { useGenerateQuickQuizMutation, useSubmitQuizMutation } from '../quiz.queries'
import { useQuizStore } from '../quiz.store'
import QuizQuestion from '../components/QuizQuestion'
import QuizResults from '../components/QuizResults'
import { useQuery } from '@tanstack/react-query'
import { getSubjects } from '@/features/subjects/subjects.api'
import { Spinner } from '@/components/ui/Spinner'

export default function QuickQuizPage() {
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const genMut = useGenerateQuickQuizMutation()
  const submitMut = useSubmitQuizMutation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const setQuestions = useQuizStore((s) => s.setQuestions)
  const questions = useQuizStore((s) => s.questions)
  const answers = useQuizStore((s) => s.answers)
  const setAnswer = useQuizStore((s) => s.setAnswer)
  const result = useQuizStore((s) => s.result)
  const submitted = useQuizStore((s) => s.submitted)

  const subjectsQ = useQuery({ queryKey: ['subjects'], queryFn: getSubjects })

  const handleStart = () => {
    setIsGenerating(true)
    genMut.mutate({ subjectId, difficulty, count: 5 }, { onSuccess: (data) => setQuestions(data.questions), onSettled: () => setIsGenerating(false) })
  }

  if (isGenerating) return <div className="p-6"><Spinner /></div>

  if (result) return <QuizResults result={result} />

  return (
    <div className="p-6">
      {!questions.length ? (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm mb-1">Subject</label>
            {subjectsQ.isLoading && <div className="text-sm text-[#64748b]">Loading subjects...</div>}
            {subjectsQ.isError && <div className="text-sm text-[#991b1b]">Failed to load subjects</div>}
            {!subjectsQ.isLoading && !subjectsQ.isError && (
              <select className="w-full rounded-lg border border-[#e9eaf2] p-2" value={subjectId ?? ''} onChange={(e) => setSubjectId(e.target.value || undefined)}>
                <option value="">Any subject</option>
                {(subjectsQ.data as any[])?.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Difficulty</label>
            <select className="w-full rounded-lg border border-[#e9eaf2] p-2" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <button className="rounded-lg bg-[#607afb] px-4 py-2 text-white disabled:opacity-60" disabled={subjectsQ.isLoading || subjectsQ.isError} onClick={handleStart}>
              Start Quiz
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Quiz</h2>
          {questions.map((q) => (
            <QuizQuestion key={q.id} question={q} answer={answers[q.id]} onAnswer={(a) => setAnswer(q.id, a)} submitted={submitted} result={(result as any)?.question_results?.find((r: any) => r.question_id === q.id)} />
          ))}
          <div className="mt-4">
            <button className="rounded-lg bg-[#607afb] px-4 py-2 text-white disabled:opacity-60" disabled={!questions.length || Object.keys(answers).length !== questions.length || isSubmitting} onClick={() => {
              const payload = Object.keys(answers).map((qid) => ({ question_id: qid, answer: answers[qid] }))
              const quizId = genMut.data?.id
              if (quizId) {
                setIsSubmitting(true)
                submitMut.mutate({ quizId, answers: payload }, { onSuccess: (res) => useQuizStore.getState().setResult(res), onSettled: () => setIsSubmitting(false) })
              }
            }}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
