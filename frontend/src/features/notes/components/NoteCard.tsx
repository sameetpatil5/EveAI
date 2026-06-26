import type { NoteListItem } from '../notes.types'

export default function NoteCard({ note, selected, onClick }: { note: NoteListItem; selected?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-3xl border p-5 text-left transition ${
        selected
          ? 'border-[#607afb] bg-[#eff6ff] shadow-sm'
          : 'border-[#e9eaf2] bg-white hover:border-[#c7d2fe] hover:bg-[#fafbff]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#0f172a]">{note.title}</p>
          {note.description ? <p className="mt-2 text-sm text-[#64748b] line-clamp-2">{note.description}</p> : null}
        </div>
        <p className="text-xs text-[#94a3b8]">{new Date(note.created_at).toLocaleDateString()}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {note.subject_name ? (
          <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#0369a1]">
            {note.subject_name}
          </span>
        ) : null}
      </div>
    </button>
  )
}
