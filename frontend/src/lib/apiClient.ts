import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    const headers = (config.headers ?? {}) as Record<string, string>
    headers.Authorization = `Bearer ${token}`
    config.headers = headers as typeof config.headers
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (response.data?.success === false) {
      throw new Error(response.data.error || 'Request failed')
    }
    return response.data?.data ?? response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/auth/login'
    }
    throw error
  }
)

export default apiClient
