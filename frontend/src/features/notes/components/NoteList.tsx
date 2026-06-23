import NoteCard from './NoteCard'
import type { NoteListItem } from '../notes.types'

export default function NoteList({ notes, selectedId, onSelect }: { notes: NoteListItem[]; selectedId?: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {notes.map((n) => (
        <NoteCard key={n.id} note={n} selected={selectedId === n.id} onClick={() => onSelect(n.id)} />
      ))}
    </div>
  )
}
