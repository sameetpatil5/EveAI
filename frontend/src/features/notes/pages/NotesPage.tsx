import { useState } from 'react'
import { useNotesQuery, useNoteQuery, useCreateNoteMutation, useUpdateNoteMutation } from '../notes.queries'
import NoteList from '../components/NoteList'
import NoteEditor from '../components/NoteEditor'
import { Spinner } from '@/components/ui/Spinner'

export default function NotesPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const notesQ = useNotesQuery()
  const noteQ = useNoteQuery(selectedNoteId)
  const createMut = useCreateNoteMutation()
  const updateMut = useUpdateNoteMutation()

  if (notesQ.isLoading) return <div className="p-6"><Spinner /></div>

  const notes = notesQ.data?.notes ?? []

  const handleSelect = (id: string) => setSelectedNoteId(id)

  const handleSave = async (data: any) => {
    if (!selectedNoteId) {
      const res = await createMut.mutateAsync(data)
      if (res?.id) setSelectedNoteId(res.id)
    } else {
      await updateMut.mutateAsync({ noteId: selectedNoteId, data })
    }
  }

  return (
    <div className="p-6 grid grid-cols-[320px_1fr] gap-6">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notes</h3>
          <button className="rounded-lg bg-[#607afb] px-3 py-1 text-white" onClick={() => setSelectedNoteId(null)}>New</button>
        </div>
        <NoteList notes={notes} selectedId={selectedNoteId} onSelect={handleSelect} />
      </div>
      <div>
        <NoteEditor note={noteQ.data ?? undefined} onSave={handleSave} />
      </div>
    </div>
  )
}
