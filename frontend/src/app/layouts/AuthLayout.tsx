import { Outlet, useLocation } from 'react-router-dom'

export default function AuthLayout() {
  const location = useLocation()
  const isPublicContentRoute = ['/', '/about', '/contact'].includes(location.pathname)

  return (
    <div className="flex h-screen min-h-screen flex-col bg-[#f8f9fc]">
      <main className="flex-1 min-h-0">
        <div className={`mx-auto flex h-full min-h-0 w-full flex-col px-4 py-4 ${isPublicContentRoute ? 'max-w-6xl' : 'max-w-3xl'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
