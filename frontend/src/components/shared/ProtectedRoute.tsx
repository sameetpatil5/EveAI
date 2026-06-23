import { Navigate, Outlet } from 'react-router-dom'
import { PageLoader } from '@/components/shared/PageLoader'
import { useAuthStore } from '@/stores/auth.store'

export function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (!token) {
    return <Navigate to="/auth/login" replace />
  }

  if (token && user === null) {
    return <PageLoader />
  }

  if (user && user.onboarding_complete === false) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
