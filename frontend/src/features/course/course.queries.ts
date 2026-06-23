import { useQuery } from '@tanstack/react-query'
import { getCourseStructure } from './course.api'
import type { CourseStructure } from './course.types'

export const useCourseStructureQuery = (courseId: string | null) =>
  useQuery<CourseStructure, Error>({
    queryKey: ['course', courseId],
    queryFn: () => getCourseStructure(courseId as string),
    enabled: !!courseId,
  })
