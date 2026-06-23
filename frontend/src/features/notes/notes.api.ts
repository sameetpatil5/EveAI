import apiClient from '@/lib/apiClient'
import type { Note, NoteListItem } from './notes.types'

export const getNotes = (subjectId?: string): Promise<{ notes: NoteListItem[] }> =>
  apiClient.get('/notes', { params: { subject_id: subjectId } })

export const getNote = (noteId: string): Promise<Note> => apiClient.get(`/notes/${noteId}`)

export const createNote = (data: { title: string; content: string; description?: string; subject_id?: string }): Promise<{ id: string; title: string; created_at: string }> =>
  apiClient.post('/notes', data)

export const updateNote = (noteId: string, data: Partial<Note>): Promise<void> => apiClient.put(`/notes/${noteId}`, data)

export const deleteNote = (noteId: string): Promise<void> => apiClient.delete(`/notes/${noteId}`)
