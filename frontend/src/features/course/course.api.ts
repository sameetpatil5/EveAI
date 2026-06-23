import apiClient from '@/lib/apiClient'
import type { CourseStructure } from './course.types'

export const getCourseBySubject = (subjectId: string): Promise<CourseStructure> =>
  apiClient.get(`/subjects/${subjectId}/course`)

export const getCourseStructure = (courseId: string): Promise<CourseStructure> =>
  apiClient.get(`/courses/${courseId}/structure`)
