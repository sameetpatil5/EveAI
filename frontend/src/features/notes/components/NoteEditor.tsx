import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function NoteEditor({ note, onSave }: { note?: any; onSave: (data: any) => void }) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [description, setDescription] = useState(note?.description ?? '')

  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setDescription(note?.description ?? '')
  }, [note?.id])

  const handleSave = () => {
    onSave({ title: title.trim(), content, description: description?.trim() || undefined })
  }

  return (
    <div className="space-y-4">
      <div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2" />
      </div>
      <div>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2" />
      </div>
      <div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes..." className="w-full rounded-lg border border-[#e9eaf2] p-4 min-h-[320px]" />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  )
}
