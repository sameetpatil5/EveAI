import { useQuery, useMutation } from '@tanstack/react-query'
import { getNotes, getNote, createNote, updateNote, deleteNote } from './notes.api'
import { queryClient } from '@/lib/queryClient'

export const useNotesQuery = (subjectId?: string) =>
  useQuery({ queryKey: ['notes', subjectId ?? 'all'], queryFn: () => getNotes(subjectId) })

export const useNoteQuery = (noteId: string | null) =>
  useQuery({ queryKey: ['note', noteId], enabled: !!noteId, queryFn: () => (noteId ? getNote(noteId) : Promise.reject('no id')) })

export const useCreateNoteMutation = () =>
  useMutation({ mutationFn: (data: { title: string; content: string; description?: string; subject_id?: string }) => createNote(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }) })

export const useUpdateNoteMutation = () =>
  useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: Partial<any> }) => updateNote(noteId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', variables.noteId] })
    },
  })

export const useDeleteNoteMutation = () =>
  useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: (_data, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      queryClient.invalidateQueries({ queryKey: ['note', noteId] })
    },
  })
