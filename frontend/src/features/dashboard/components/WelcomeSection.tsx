interface WelcomeSectionProps {
  name: string
}

export function WelcomeSection({ name }: WelcomeSectionProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-8 shadow-sm">
      <div className="text-sm text-[#64748b]">{greeting}, {name}!</div>
      <div className="mt-3 text-3xl font-semibold text-[#0f172a]">Welcome back to EveAI</div>
      <p className="mt-3 max-w-2xl text-sm text-[#475569]">Here’s your progress summary and next lessons for today.</p>
    </div>
  )
}
