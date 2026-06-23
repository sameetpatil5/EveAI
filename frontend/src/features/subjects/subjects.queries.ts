import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { createSubject, deleteSubject, getSubject, getSubjects } from './subjects.api'
import type { Subject, SubjectCreate } from './subjects.types'

export const useSubjectsQuery = () =>
  useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  })

export const useSubjectQuery = (id: string) =>
  useQuery<Subject, Error>({
    queryKey: ['subject', id],
    queryFn: () => getSubject(id),
    enabled: !!id,
  })

export const useCreateSubjectMutation = () =>
  useMutation<Subject, Error, SubjectCreate>({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })

export const useDeleteSubjectMutation = () =>
  useMutation<void, Error, string>({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
