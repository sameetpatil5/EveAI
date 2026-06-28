import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials } from '@/lib/utils'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard' },
    { to: '/app/subjects', label: 'Subjects' },
    { to: '/app/schedule', label: 'Schedule' },
    { to: '/app/notes', label: 'Notes' },

    { to: '/app/insights', label: 'Insights' },
  ]

  

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e9eaf2] shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-0">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img
                src="/eveai_logo.png"
                alt="EveAI"
                className="h-9 w-9 rounded-lg object-contain"
              />
              <img
                src="/eveai_text.png"
                alt="EveAI"
                className="h-6 object-contain"
              />
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
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

          {/* Right side: Search + Avatar */}
          <div className="flex items-center gap-3">
            {/* Search removed per request */}

            {/* Profile Avatar */}
            {user ? (
              <button
                onClick={() => navigate('/app/profile')}
                style={{ height: '44px', width: '44px' }}
                className="rounded-full bg-[#eef2ff] text-[#0f172a] text-base font-extrabold flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border border-[#dbe4ff] shadow-sm"
              >
                {getInitials(user.email)}
              </button>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm font-semibold text-[#607afb] hover:text-[#4f63df]"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
