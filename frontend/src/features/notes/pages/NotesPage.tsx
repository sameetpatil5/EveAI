import { useState } from 'react'
import { useNotesQuery, useNoteQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from '../notes.queries'
import { useSubjectsQuery } from '@/features/subjects/subjects.queries'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export default function NotesPage() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  const notesQ = useNotesQuery(subjectFilter && subjectFilter !== '__general__' ? subjectFilter : undefined)
  const noteQ = useNoteQuery(activeNoteId)
  const subjectsQ = useSubjectsQuery()
  const createMut = useCreateNoteMutation()
  const updateMut = useUpdateNoteMutation()
  const deleteMut = useDeleteNoteMutation()

  if (notesQ.isLoading) return <div className="p-6"><Spinner /></div>

  const allNotes = notesQ.data ?? []
  const subjects = subjectsQ.data ?? []
  const selectedNote = noteQ.data
  const notes = subjectFilter === '__general__' ? allNotes.filter((note) => !note.subject_id) : allNotes

  const openCreateModal = () => {
    setActiveNoteId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (id: string) => {
    setActiveNoteId(id)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setActiveNoteId(null)
  }

  const handleSave = async (data: any) => {
    if (!activeNoteId) {
      const res = await createMut.mutateAsync(data)
      if (res?.id) setActiveNoteId(res.id)
    } else {
      await updateMut.mutateAsync({ noteId: activeNoteId, data })
    }
    closeModal()
  }

  const handleDelete = async () => {
    if (!activeNoteId) return
    const confirmed = window.confirm('Delete this note? This cannot be undone.')
    if (!confirmed) return

    await deleteMut.mutateAsync(activeNoteId)
    closeModal()
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Notes</p>
          <div className="mt-2 text-xl font-semibold text-[#0f172a]">My Notes</div>
          <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
            Keep your ideas, reminders, and study notes organized in one place.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-3xl bg-[#f8fafc] px-4 py-3 text-sm text-[#475569] shadow-sm">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} available
          </div>
          <Button type="button" onClick={openCreateModal} className="w-full sm:w-auto">
            Create note
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">Notes collection</p>
            <div className="mt-2 text-xl font-semibold text-[#0f172a]">Browse and manage your notes</div>
            <p className="mt-2 text-sm text-[#64748b]">Filter by subject and open any card to review or edit it.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-3 text-sm text-[#475569]">
              <span>Subject</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
              >
                <option value="">All subjects</option>
                <option value="__general__">General</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {notes.length > 0 ? (
          <div className="min-h-0 flex-1">
            <NoteList notes={notes} selectedId={activeNoteId} onSelect={openEditModal} />
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#dbeafe] bg-[#f8fafc] p-10 text-center text-sm text-[#475569]">
            {subjectFilter === '__general__'
              ? 'No general notes found. Create a note and leave the subject empty to add it here.'
              : 'No notes found. Create a new note to start saving your ideas.'}
          </div>
        )}
      </div>

      <Modal open={isModalOpen} onClose={closeModal} title={activeNoteId ? 'Edit note' : 'Create note'}>
        <NoteEditor
          note={selectedNote}
          subjects={subjects}
          onSave={handleSave}
          onDelete={activeNoteId ? handleDelete : undefined}
        />
      </Modal>
    </div>
  )
}
