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
    <header className="sticky top-0 z-50 bg-white border-b border-[#e9eaf2]">
      <div className="mx-auto max-w-7xl px-6 py-0">
        <div style={{ height: '60px' }} className="flex items-center justify-between">
          {/* Left side: Logo + Navigation */}
          <div className="flex items-center gap-7">
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
                style={{ filter: 'brightness(0.88)' }}
              />
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
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
                style={{ height: '40px', width: '40px' }}
                className="rounded-full bg-[#eef2ff] text-[#0f172a] text-sm font-extrabold flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                {getInitials(user.email)}
              </button>
            ) : (
              <Link
                to="/auth/login"
                className="text-sm font-medium text-[#607afb] hover:text-[#4f63df]"
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
