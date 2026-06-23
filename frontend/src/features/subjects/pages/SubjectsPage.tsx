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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a]">My Subjects</h1>
          <p className="mt-2 text-sm text-[#64748b]">Manage your subjects and continue learning where you left off.</p>
        </div>
        <Button type="button" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 inline-block" size={16} />
          Add Subject
        </Button>
      </div>

      {data?.length ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
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
