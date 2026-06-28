import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials } from '@/lib/utils'

const PUBLIC_ROUTES = ['/', '/about', '/contact', '/auth/login', '/auth/register']

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname)

  const appLinks = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/subjects', label: 'Subjects' },
    { to: '/app/schedule', label: 'Schedule' },
    { to: '/app/notes', label: 'Notes' },
    { to: '/app/insights', label: 'Insights' },
  ]

  const publicLinks = [
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact Us' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9eaf2] bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-9 py-0">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img src="/eveai_logo.png" alt="EveAI" className="h-9 w-9 rounded-lg object-contain" />
              <img src="/eveai_text.png" alt="EveAI" className="h-6 object-contain" />
            </Link>

            <nav className="flex items-center gap-2">
              {(isPublicRoute ? publicLinks : appLinks).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    location.pathname.startsWith(link.to)
                      ? 'bg-[#eef2ff] text-[#607afb]'
                      : 'text-[#475569] hover:bg-[#eef2ff] hover:text-[#607afb]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isPublicRoute ? (
              <button
                onClick={() => (user ? navigate('/app/dashboard') : navigate('/auth/login'))}
                className="rounded-full bg-[#607afb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f63df]"
              >
                {user ? 'Dashboard' : 'Login'}
              </button>
            ) : user ? (
              <button
                onClick={() => navigate('/app/profile')}
                style={{ height: '44px', width: '44px' }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe4ff] bg-[#eef2ff] text-base font-extrabold text-[#0f172a] shadow-sm transition-opacity hover:opacity-90"
              >
                {getInitials(user.email)}
              </button>
            ) : (
              <Link to="/auth/login" className="text-sm font-semibold text-[#607afb] hover:text-[#4f63df]">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
