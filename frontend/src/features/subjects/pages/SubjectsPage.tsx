import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageLoader } from '@/components/shared/PageLoader'
import { AddSubjectModal } from '../components/AddSubjectModal'
import { SubjectCard } from '../components/SubjectCard'
import { useSubjectsQuery } from '../subjects.queries'

export default function SubjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, status, error } = useSubjectsQuery()
  const subjectsToRender = data ?? []

  if (status === 'pending') {
    return <PageLoader />
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-[#e9eaf2] bg-white p-8 text-sm text-[#991b1b] shadow-sm">
          Unable to load subjects: {error?.message ?? 'Please try again later.'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="mb-8 rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Subjects</div>
            <div className="mt-2 text-xl font-semibold text-[#0f172a]">My Subjects</div>
            <p className="mt-2 text-sm text-[#64748b]">Manage your subjects and continue learning where you left off.</p>
          </div>
          <Button type="button" onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 inline-block" size={16} />
            Add Subject
          </Button>
        </div>
      </div>

      {subjectsToRender.length ? (
        <div className="rounded-[28px] border border-[#e9eaf2] bg-[#f8f9fc] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Your subjects</div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#64748b]">
              {subjectsToRender.length} items
            </div>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-5">
              {subjectsToRender.map((subject) => (
                <div key={subject.id} className="w-[300px] flex-shrink-0">
                  <SubjectCard subject={subject} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          heading="No subjects yet"
          subtext="Add your subjects to build a personalized learning plan."
          action={{ label: 'Add Subject', onClick: () => setIsModalOpen(true) }}
        />
      )}

      <AddSubjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
