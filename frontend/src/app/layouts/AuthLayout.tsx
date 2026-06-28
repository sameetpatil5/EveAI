import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="h-screen min-h-screen flex flex-col bg-[#f8f9fc]">
      <main className="flex-1 min-h-0">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-col px-4 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
