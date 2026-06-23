import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Outlet />
      </div>
    </div>
  )
}
