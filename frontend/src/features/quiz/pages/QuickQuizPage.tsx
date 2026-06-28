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
  const [prompt, setPrompt] = useState<string>('')
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
  const genMut = useGenerateQuickQuizMutation()
  const setQuestions = useQuizStore((s) => s.setQuestions)
  const navigate = useNavigate()

  const subjectsQ = useQuery({ queryKey: ['subjects'], queryFn: getSubjects })
  const subjects = subjectsQ.data ?? []
  const selectedSubjectName = subjectId ? subjects.find((subject) => subject.id === subjectId)?.name ?? 'Selected subject' : 'Any subject'

  const handleGenerate = () => {
    genMut.mutate({ subjectId, difficulty, count: 5, prompt: prompt.trim() || undefined }, {
      onSuccess: (data) => {
        setQuestions(data.questions)
        setGeneratedQuiz(data)
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <Card className="overflow-hidden border-[#e9eaf2] bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]">
          <div className="border-b border-[#e9eaf2] bg-[#f8fafc] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Quick Quiz</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Create a focused quiz instantly and tailor it with a simple prompt.
                </p>
              </div>
              <div className="rounded-full bg-[#10b981]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#10b981]">
                AI Quiz
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-800">Subject</label>
                {subjectsQ.isLoading && <div className="text-sm text-slate-500">Loading subjects...</div>}
                {subjectsQ.isError && <div className="text-sm text-[#991b1b]">Failed to load subjects</div>}
                {!subjectsQ.isLoading && !subjectsQ.isError && (
                  <select
                    className="w-full rounded-2xl border border-[#dbe4ff] bg-[#f8fafc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
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
                <label className="mb-2 block text-sm font-medium text-slate-800">Difficulty</label>
                <select
                  className="w-full rounded-2xl border border-[#dbe4ff] bg-[#f8fafc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">Quiz prompt</label>
              <textarea
                className="min-h-[96px] w-full rounded-2xl border border-[#dbe4ff] bg-[#f8fafc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
                placeholder="Example: Focus on conceptual questions, include one short-answer question, and avoid memorization."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <p className="mt-2 text-sm text-slate-500">
                This helps the AI tailor the quiz to the exact topic or study goal you have in mind.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                <div className="font-medium text-slate-800">Preview</div>
                <div>{selectedSubjectName} · {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</div>
              </div>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={subjectsQ.isLoading || subjectsQ.isError || genMut.isPending}
                className="w-full sm:w-auto"
              >
                {genMut.isPending ? 'Generating…' : 'Generate Quiz'}
              </Button>
            </div>

            {genMut.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991b1b]">
                {genMut.error instanceof Error ? genMut.error.message : 'Unable to generate quiz. Please try again.'}
              </div>
            )}
          </div>
        </Card>

        {genMut.isPending && (
          <Card className="p-6 text-center">
            <Spinner size="lg" className="mx-auto text-[#607afb]" />
            <p className="mt-4 text-sm text-slate-500">Preparing your quiz...</p>
          </Card>
        )}

        {generatedQuiz && (
          <Card className="p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Quiz ready</div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{generatedQuiz.title ?? 'Quick quiz'}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Your quiz is ready to start. Continue to the quiz page and answer every question.
                </p>
              </div>

              <div className="grid gap-3 sm:justify-end">
                <div className="rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm text-slate-600">
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
