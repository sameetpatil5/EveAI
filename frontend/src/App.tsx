import './App.css';
import AppRoutes from '@/app/routes'
import Navbar from '@/components/Navbar';
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { getMe } from '@/features/auth/auth.api'

const App: React.FC = () => {
  // On mount: hydrate auth if token exists
  useEffect(() => {
    const token = useAuthStore.getState().token
    if (!token) return

    ;(async () => {
      try {
        const user = await getMe()
        useAuthStore.getState().setAuth(token, user)
      } catch (err) {
        useAuthStore.getState().clearAuth()
      }
    })()
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <AppRoutes />
    </div>
  )
}

export default App;
