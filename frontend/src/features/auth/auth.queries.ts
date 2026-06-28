import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, register } from './auth.api'
import type { AuthResponse, LoginRequest, RegisterRequest } from './auth.types'
import { useAuthStore } from '@/stores/auth.store'

export function useLoginMutation() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate(data.user.onboarding_complete ? '/app/dashboard' : '/onboarding')
    },
  })
}

export function useRegisterMutation() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: register,
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate(data.user.onboarding_complete ? '/app/dashboard' : '/onboarding')
    },
  })
}
