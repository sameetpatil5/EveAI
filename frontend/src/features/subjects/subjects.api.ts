import apiClient from '@/lib/apiClient'
import type { Subject, SubjectCreate, SubjectUpdate } from './subjects.types'

export const getSubjects = (): Promise<Subject[]> => apiClient.get('/subjects')

export const getSubject = (id: string): Promise<Subject> => apiClient.get(`/subjects/${id}`)

export const createSubject = (data: SubjectCreate): Promise<Subject> => apiClient.post('/subjects', data)

export const updateSubject = (id: string, data: SubjectUpdate): Promise<Subject> => apiClient.put(`/subjects/${id}`, data)

export const deleteSubject = (id: string): Promise<void> => apiClient.delete(`/subjects/${id}`)
