import NoteCard from './NoteCard'
import type { NoteListItem } from '../notes.types'

export default function NoteList({ notes, selectedId, onSelect }: { notes: NoteListItem[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="h-full overflow-y-auto pr-2">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
        {notes.map((n) => (
          <NoteCard key={n.id} note={n} selected={selectedId === n.id} onClick={() => onSelect(n.id)} />
        ))}
      </div>
    </div>
  )
}
