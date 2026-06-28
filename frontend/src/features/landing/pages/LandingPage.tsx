import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f8fafc] px-4 py-2 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-[#e9eaf2] bg-white p-8 shadow-sm sm:p-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-[#0f172a] sm:text-5xl">
            EveAI — Your Personalized Learning OS
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#64748b] sm:text-lg">
            AI-powered courses tailored to how you think, built around what you love.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link
            to="/auth/register"
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#607afb] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f63df]"
          >
            Get Started
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-[#e9eaf2] bg-white px-6 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-50"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 text-left">
            <h2 className="text-lg font-semibold text-[#0f172a]">Personalized learning paths</h2>
            <p className="mt-2 text-sm text-[#475569]">Follow AI-curated courses that adapt to your interests and pace.</p>
          </div>
          <div className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 text-left">
            <h2 className="text-lg font-semibold text-[#0f172a]">Smart progress tracking</h2>
            <p className="mt-2 text-sm text-[#475569]">See your achievements, streaks, and learning habits in one place.</p>
          </div>
          <div className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 text-left">
            <h2 className="text-lg font-semibold text-[#0f172a]">Built around you</h2>
            <p className="mt-2 text-sm text-[#475569]">A study experience designed for your goals, hobbies, and daily rhythm.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
