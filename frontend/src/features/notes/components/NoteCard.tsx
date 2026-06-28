import type { NoteListItem } from '../notes.types'

export default function NoteCard({ note, selected, onClick }: { note: NoteListItem; selected?: boolean; onClick?: () => void }) {
  const createdDate = new Date(note.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full w-full flex-col rounded-3xl border p-5 text-left shadow-sm transition-all duration-200 ${
        selected
          ? 'border-[#607afb] bg-[#f5f8ff] shadow-[0_0_0_1px_rgba(96,122,251,0.12)]'
          : 'border-[#e9eaf2] bg-[#f8fafc] hover:border-[#c7d2fe] hover:bg-[#f8fbff] hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0f172a]">{note.title}</p>
          {note.description ? <p className="mt-2 line-clamp-3 text-sm text-[#64748b]">{note.description}</p> : null}
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-[#64748b] shadow-sm">
          {createdDate}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e9eaf2] pt-4">
        <div className="flex flex-wrap gap-2">
          {note.subject_name ? (
            <span className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#0369a1]">
              {note.subject_name}
            </span>
          ) : (
            <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-semibold text-[#64748b]">
              General
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
