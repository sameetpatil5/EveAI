import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { Note } from '../notes.types'
import type { Subject } from '@/features/subjects/subjects.types'

interface NoteEditorProps {
  note?: Note
  subjects?: Subject[]
  onSave: (data: any) => void
  onDelete?: () => void
}

export default function NoteEditor({ note, subjects = [], onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [description, setDescription] = useState(note?.description ?? '')
  const [subjectId, setSubjectId] = useState(note?.subject_id ?? '')

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setDescription(note?.description ?? '')
    setSubjectId(note?.subject_id ?? '')
  }, [note?.id])

  const handleSave = () => {
    const cleanedTitle = title.trim()
    if (!cleanedTitle) return

    onSave({
      title: cleanedTitle,
      content,
      description: description?.trim() || undefined,
      subject_id: subjectId || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#0f172a]">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
            className="w-full rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#0f172a]">Subject</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
          >
            <option value="">General</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#0f172a]">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a short description"
          className="w-full rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-[#0f172a]">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here"
          className="min-h-[320px] w-full rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-4 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[#64748b]">
          {note ? 'Update the note and save your changes.' : 'Create a new note to keep your ideas organized.'}
        </div>

        <div className="flex flex-wrap gap-3">
          {note && onDelete ? (
            <Button type="button" variant="secondary" size="sm" onClick={onDelete} className="text-[#b91c1c] hover:bg-red-50 hover:text-[#991b1b]">
              Delete note
            </Button>
          ) : null}
          <Button type="button" onClick={handleSave}>
            Save note
          </Button>
        </div>
      </div>
    </div>
  )
}
