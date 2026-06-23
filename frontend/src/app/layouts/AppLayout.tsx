import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
