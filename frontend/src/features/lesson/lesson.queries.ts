import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import {
  getLesson,
  retryLessonGeneration,
  markLessonComplete,
  getNextLesson,
} from './lesson.api'
import type { Lesson } from './lesson.types'

export const useLessonQuery = (lessonId: string | null) =>
  useQuery<Lesson, Error>({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId as string),
    enabled: !!lessonId,
    refetchInterval: (data) =>
      data?.generation_status === 'generating' ? 3000 : false,
    refetchOnWindowFocus: false,
  })

export const useRetryLessonGenerationMutation = () =>
  useMutation<{ status: string }, Error, string>({
    mutationFn: (lessonId) => retryLessonGeneration(lessonId),
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['course'] })
    },
  })

export const useMarkCompleteMutation = () =>
  useMutation<void, Error, string>({
    mutationFn: (lessonId) => markLessonComplete(lessonId),
    onSuccess: (_, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] })
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      queryClient.invalidateQueries({ queryKey: ['course'] })
    },
  })

export const useGetNextLessonQuery = (lessonId: string | null) =>
  useQuery<Lesson | null, Error>({
    queryKey: ['lesson-next', lessonId],
    queryFn: () => getNextLesson(lessonId as string),
    enabled: !!lessonId,
  })
