import { Link } from 'react-router-dom'

const TEAM = [
  {
    name: 'Kartik Dani',
    role: 'Product Management',
    bio: 'Shapes the product vision, aligning AI capabilities with an intuitive and seamless learning experience.',
    initials: 'KD',
    color: '#607afb',
  },
  {
    name: 'Sameet Patil',
    role: 'Backend & AI Architecture',
    bio: 'Designs the AI infrastructure and intelligent systems that power personalized, adaptive learning.',
    initials: 'SP',
    color: '#7c3aed',
  },
  {
    name: 'Siddhant Ingole',
    role: 'Frontend & API Design',
    bio: 'Builds responsive interfaces and robust APIs, ensuring a smooth and connected user experience.',
    initials: 'SI',
    color: '#0ea5e9',
  },
  {
    name: 'Samruddhi Shende',
    role: 'Research & UX Design',
    bio: 'Transforms educational research into learner-centered experiences that are engaging, effective, and accessible.',
    initials: 'SS',
    color: '#10b981',
  },
]

const PRINCIPLES = [
  {
    title: 'Hobbies are a learning tool, not a distraction',
    body:
      'EveAI was built on the insight that students retain more when concepts are explained through things they already care about. A cricket fan understands projectile motion better through a bouncer than a textbook diagram.',
  },
  {
    title: 'Balance is not a luxury, it is a strategy',
    body:
      'Rigid timetables cause burnout. EveAI\'s scheduling engine treats rest and hobbies as first-class citizens alongside academics, not afterthoughts.',
  },
  {
    title: 'Personalization must be earned through real data',
    body:
      'We do not personalize with labels. EveAI observes how you learn — pace, errors, engagement — and adapts the curriculum and schedule accordingly, session by session.',
  },
]

const TECH_HIGHLIGHTS = [
  { label: 'Frontend', value: 'React.js + TypeScript + Vite' },
  { label: 'Backend', value: 'FastAPI (Python)' },
  { label: 'Structured Data', value: 'PostgreSQL' },
  { label: 'Semantic Memory', value: 'Qdrant (Vector DB)' },
  { label: 'AI Layer', value: 'LLMs + Multi-Agent Architecture' },
  { label: 'Retrieval', value: 'RAG Pipeline' },
]

export default function AboutPage() {
  return (
    <div className="hide-scrollbar h-full overflow-y-auto bg-[#f8fafc] px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-12 text-center shadow-sm sm:px-14">
          <span className="inline-block rounded-full border border-[#e0e3ff] bg-[#eef0ff] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#607afb]">
            About EveAI
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            A Personalized Teaching Assistant That Thinks Like You Do
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#64748b] sm:text-base">
            EveAI was built to solve a real gap in digital education: the disconnect between what students love and what
            they are required to learn. We built a system that refuses to treat those as opposites.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef0ff] text-lg">🎓</div>
            <h2 className="text-base font-semibold text-[#0f172a]">The problem we set out to solve</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              Most e-learning platforms treat hobbies and academics as competing parts of a student's day. The result:
              rigid timetables, low engagement, and burnout. Students switch off — not because they are incapable, but
              because nothing feels relevant to them.
            </p>
          </div>
          <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef0ff] text-lg">💡</div>
            <h2 className="text-base font-semibold text-[#0f172a]">What EveAI does differently</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
              EveAI integrates a dynamic scheduling engine with context-aware AI tutoring. It explains academic concepts
              using examples from each student's own interests, and continuously adapts to their learning pace and
              well-being — all within a single unified platform.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-10 shadow-sm sm:px-10">
          <h2 className="text-xl font-bold text-[#0f172a] sm:text-2xl">The principles we built on</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Grounded in educational psychology, cognitive science, and real student feedback.
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className="flex gap-4 rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5">
                <span className="mt-0.5 select-none text-2xl font-black text-[#607afb] opacity-20">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#0f172a]">{p.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-10 shadow-sm sm:px-10">
          <h2 className="text-xl font-bold text-[#0f172a] sm:text-2xl">Meet the team</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            Four builders with one shared mission — make learning feel personal again.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="flex gap-4 rounded-3xl border border-[#e9eaf2] bg-[#f8fafc] p-5 transition hover:border-[#c7ceff]"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0f172a]">{member.name}</p>
                  <p className="text-xs font-medium text-[#607afb]">{member.role}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-[#eef0ff] px-8 py-10 shadow-sm sm:px-10">
          <h2 className="text-xl font-bold text-[#0f172a] sm:text-2xl">The technology behind EveAI</h2>
          <p className="mt-2 text-sm text-[#64748b]">
            A modular architecture chosen to maximise performance, adaptability, and AI capability.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_HIGHLIGHTS.map((t) => (
              <div key={t.label} className="rounded-2xl border border-[#d9dcff] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#607afb]">{t.label}</p>
                <p className="mt-1 text-sm font-medium text-[#0f172a]">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="flex flex-col items-center gap-4 rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-10 text-center shadow-sm sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">Curious to try it yourself?</h2>
            <p className="mt-1 text-sm text-[#64748b]">Create an account and see EveAI adapt to you from day one.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center rounded-2xl bg-[#607afb] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f63df]"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-[#e9eaf2] bg-white px-6 py-2.5 text-sm font-semibold text-[#0f172a] transition hover:bg-slate-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-8 w-full max-w-6xl pb-4 text-center text-xs text-[#94a3b8]">
        © {new Date().getFullYear()} EveAI. Built with ❤️ by the EveAI team.
      </footer>
    </div>
  )
}
