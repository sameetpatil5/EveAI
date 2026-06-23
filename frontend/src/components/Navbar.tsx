import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials } from '@/lib/utils'

export default function Navbar() {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/subjects', label: 'Subjects' },
    { to: '/app/schedule', label: 'Schedule' },
    { to: '/app/notes', label: 'Notes' },
    { to: '/app/insights', label: 'Insights' },
    { to: '/app/profile', label: 'Profile' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e9eaf2]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold text-[#0f172a]">
            EveAI
          </Link>
          <nav className="hidden items-center gap-3 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm ${location.pathname.startsWith(link.to) ? 'text-[#607afb]' : 'text-[#475569] hover:text-[#607afb]'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f63df]">
                {getInitials(user.email)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth/login" className="text-sm text-[#607afb]">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
