import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { getLesson, markLessonComplete, getNextLesson } from './lesson.api'
import type { Lesson } from './lesson.types'

export const useLessonQuery = (lessonId: string | null) =>
  useQuery<Lesson, Error>({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId as string),
    enabled: !!lessonId,
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
