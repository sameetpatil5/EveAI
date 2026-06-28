import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🎯',
    title: 'Interest-Driven Learning',
    description:
      'EveAI explains academic concepts through the lens of your hobbies — whether that\'s gaming, music, or sport.',
  },
  {
    icon: '🗓️',
    title: 'Intelligent Scheduling',
    description:
      'A dynamic scheduler balances academics, hobbies, and rest — adapting as your priorities shift.',
  },
  {
    icon: '🤖',
    title: 'AI Tutoring, Context-Aware',
    description:
      'Powered by LLMs and a RAG pipeline, every explanation is grounded in what you already know and love.',
  },
  {
    icon: '📈',
    title: 'Smart Progress Tracking',
    description:
      'See streaks, milestones, and learning trends. EveAI feeds your performance back into the system to sharpen personalization.',
  },
  {
    icon: '🧠',
    title: 'Adaptive Memory',
    description:
      'The platform remembers your pace, preferences, and past sessions to keep every lesson fresh and relevant.',
  },
  {
    icon: '⚖️',
    title: 'Well-being First',
    description:
      'Built-in rest scheduling and burnout-aware heuristics ensure learning never comes at the cost of your mental health.',
  },
]

const STEPS = [
  { number: '01', label: 'Tell us about yourself', body: 'Share your subjects, hobbies, and daily schedule during onboarding.' },
  { number: '02', label: 'Get your personalised plan', body: 'EveAI generates a curriculum and timetable tailored to you — in seconds.' },
  { number: '03', label: 'Learn with context', body: 'Study through examples drawn from what you actually care about.' },
  { number: '04', label: 'Grow over time', body: 'The platform adapts continuously as your interests and progress evolve.' },
]

export default function LandingPage() {
  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-14 text-center shadow-sm sm:px-14 sm:py-20">
          <span className="inline-block rounded-full border border-[#e0e3ff] bg-[#eef0ff] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#607afb]">
            AI-Powered E-Learning
          </span>
          <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-bold tracking-tight text-[#0f172a] sm:text-5xl">
            Learn Academics Through&nbsp;
            <span className="text-[#607afb]">What You Love</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#64748b] sm:text-lg">
            EveAI is a personalized teaching assistant that blends your hobbies into every lesson — so you stay
            curious, engaged, and ahead.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              to="/auth/register"
              className="inline-flex min-w-[180px] items-center justify-center rounded-2xl bg-[#607afb] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#4f63df]"
            >
              Get Started Free
            </Link>
            <Link
              to="/about"
              className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-[#e9eaf2] bg-white px-7 py-3 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="grid grid-cols-3 divide-x divide-[#e9eaf2] rounded-[24px] border border-[#e9eaf2] bg-white shadow-sm">
          {[
            { value: '3 AI Agents', label: 'working together' },
            { value: 'Hobby + Academics', label: 'unified in one plan' },
            { value: 'Adapts Daily', label: 'to your progress' },
          ].map((stat) => (
            <div key={stat.label} className="px-6 py-6 text-center">
              <p className="text-xl font-bold text-[#0f172a] sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-xs text-[#64748b]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-10 shadow-sm sm:px-10">
          <h2 className="text-center text-2xl font-bold text-[#0f172a] sm:text-3xl">
            Everything you need to learn smarter
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-[#64748b]">
            Built with a multi-agent AI architecture, semantic memory, and adaptive scheduling.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 text-left transition hover:border-[#c7ceff] hover:shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef0ff] text-lg">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-[#0f172a]">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-[#eef0ff] px-8 py-10 shadow-sm sm:px-10">
          <h2 className="text-center text-2xl font-bold text-[#0f172a] sm:text-3xl">How EveAI works</h2>
          <p className="mt-2 text-center text-sm text-[#64748b]">
            From onboarding to mastery in four simple steps.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-3xl border border-[#d9dcff] bg-white p-5 text-left">
                <span className="text-3xl font-black text-[#607afb] opacity-30">{step.number}</span>
                <h3 className="mt-2 text-sm font-semibold text-[#0f172a]">{step.label}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="rounded-[32px] bg-[#607afb] px-8 py-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to learn the way you were meant to?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-[#c7d1ff]">
            Join EveAI and experience a curriculum that actually fits your life.
          </p>
          <Link
            to="/auth/register"
            className="mt-7 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-3 text-sm font-semibold text-[#607afb] transition hover:bg-[#f0f2ff]"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-8 w-full max-w-6xl pb-4 text-center text-xs text-[#94a3b8]">
        © {new Date().getFullYear()} EveAI. Built with ❤️ by Kartik, Sameet, Siddhant &amp; Samruddhi.
      </footer>
    </div>
  )
}
