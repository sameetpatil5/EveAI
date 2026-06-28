import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="h-full min-h-0 flex flex-1 flex-col overflow-hidden bg-[#f8f9fc]">
      <main className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden max-w-6xl px-4 pt-2 pb-2">
        <Outlet />
      </main>
    </div>
  )
}
