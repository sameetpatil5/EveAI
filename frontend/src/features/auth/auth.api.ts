import apiClient from '@/lib/apiClient'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from './auth.types'

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  apiClient.post('/auth/login', data)

export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  apiClient.post('/auth/register', data)

export const getMe = (): Promise<User> => apiClient.get('/auth/me')
