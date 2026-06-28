import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import {
  getLesson,
  retryLessonGeneration,
  markLessonComplete,
  getNextLesson,
} from './lesson.api'
import type { Lesson } from './lesson.types'

export const useLessonQuery = (lessonId: string | null | undefined) =>
  useQuery<Lesson, Error>({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId as string),
    enabled: !!lessonId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const lesson = query.state.data
      if (!lesson) return false
      return lesson.generation_status !== 'complete' && lesson.generation_status !== 'failed'
        ? 5000
        : false
    },
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
      queryClient.invalidateQueries({ queryKey: ['dashboard-state'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['insights'] })
    },
  })

export const useGetNextLessonQuery = (lessonId: string | null) =>
  useQuery<Lesson | null, Error>({
    queryKey: ['lesson-next', lessonId],
    queryFn: () => getNextLesson(lessonId as string),
    enabled: !!lessonId,
  })
