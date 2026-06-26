import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Quiz } from '../quiz.types'
import { useGenerateQuickQuizMutation } from '../quiz.queries'
import { useQuizStore } from '../quiz.store'
import { useQuery } from '@tanstack/react-query'
import { getSubjects } from '@/features/subjects/subjects.api'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function QuickQuizPage() {
  const [subjectId, setSubjectId] = useState<string | undefined>(undefined)
  const [difficulty, setDifficulty] = useState<string>('easy')
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
  const genMut = useGenerateQuickQuizMutation()
  const setQuestions = useQuizStore((s) => s.setQuestions)
  const navigate = useNavigate()

  const subjectsQ = useQuery({ queryKey: ['subjects'], queryFn: getSubjects })
  const subjects = subjectsQ.data ?? []
  const selectedSubjectName = subjectId ? subjects.find((subject) => subject.id === subjectId)?.name ?? 'Selected subject' : 'Any subject'

  const handleGenerate = () => {
    genMut.mutate({ subjectId, difficulty, count: 5 }, {
      onSuccess: (data) => {
        setQuestions(data.questions)
        setGeneratedQuiz(data)
      },
    })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-6">
        <Card className="p-8">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-semibold text-[#0f172a]">Quick Quiz</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
                Generate a short quiz instantly. Once your quiz is ready, continue to the dedicated quiz page to answer questions and submit your responses.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">Subject</label>
                {subjectsQ.isLoading && <div className="text-sm text-[#64748b]">Loading subjects...</div>}
                {subjectsQ.isError && <div className="text-sm text-[#991b1b]">Failed to load subjects</div>}
                {!subjectsQ.isLoading && !subjectsQ.isError && (
                  <select
                    className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
                    value={subjectId ?? ''}
                    onChange={(e) => setSubjectId(e.target.value || undefined)}
                  >
                    <option value="">Any subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0f172a] mb-2">Difficulty</label>
                <select
                  className="w-full rounded-3xl border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-[#475569]">
                  <div className="font-medium">Preview</div>
                  <div>{selectedSubjectName} · {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
                </div>

                <Button
                  type="button"
                  onClick={handleGenerate}
                  disabled={subjectsQ.isLoading || subjectsQ.isError || genMut.isPending}
                  className="w-full sm:w-auto"
                >
                  {genMut.isPending ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </div>

              {genMut.isError && (
                <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991b1b]">
                  {genMut.error instanceof Error ? genMut.error.message : 'Unable to generate quiz. Please try again.'}
                </div>
              )}
            </div>
          </div>
        </Card>

        {genMut.isPending && (
          <Card className="p-8 text-center">
            <Spinner size="lg" className="mx-auto text-[#607afb]" />
            <p className="mt-4 text-sm text-[#64748b]">Preparing your quiz...</p>
          </Card>
        )}

        {generatedQuiz && (
          <Card className="p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-[#64748b]">Quiz ready</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">{generatedQuiz.title ?? 'Quick quiz'}</h2>
                <p className="mt-2 text-sm text-[#475569]">
                  Your quiz is ready to start. You can now continue to the quiz page and answer all questions.
                </p>
              </div>

              <div className="grid gap-3 sm:justify-end">
                <div className="rounded-3xl bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
                  {generatedQuiz.questions.length} questions
                </div>
                <Button type="button" onClick={() => navigate(`/app/quick-quiz/take/${generatedQuiz.id}`)}>
                  Begin Quiz
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
