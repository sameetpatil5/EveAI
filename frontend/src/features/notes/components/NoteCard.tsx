import type { NoteListItem } from '../notes.types'

export default function NoteCard({ note, selected, onClick }: { note: NoteListItem; selected?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-lg border p-4 ${selected ? 'border-[#607afb] bg-[#f8fafc]' : 'border-[#e9eaf2] bg-white'}`}>
      <div className="text-sm font-medium text-[#0f172a]">{note.title}</div>
      {note.description ? <div className="text-xs text-[#64748b] mt-1">{note.description}</div> : null}
      <div className="text-xs text-[#94a3b8] mt-2">{new Date(note.created_at).toLocaleDateString()}</div>
    </div>
  )
}
