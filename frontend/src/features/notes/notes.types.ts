export interface NoteListItem {
  id: string
  title: string
  description?: string
  subject_id?: string
  subject_name?: string
  created_at: string
}

export interface Note extends NoteListItem {
  content: string
}
