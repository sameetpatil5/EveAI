import type { DashboardStats } from '../dashboard.types'

interface WelcomeSectionProps {
  name: string
  stats: DashboardStats
}

export function WelcomeSection({ name, stats }: WelcomeSectionProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const scheduledLessons = stats.today_lessons_count ?? 0
  const streak = stats.current_streak ?? 0

  return (
    <div className="rounded-3xl border border-[#e9eaf2] bg-white p-6 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
            {greeting}
          </div>
          <div className="text-xl font-semibold text-[#0f172a]">Welcome back, {name}</div>
          <p className="max-w-2xl text-sm leading-5 text-[#475569]">
            You have {scheduledLessons ?? '[3]'} lessons scheduled for today. You are on a {streak ?? '[12]'}-day streak.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-[#f8f9fc] p-4 text-center">
            <div className="text-xl font-semibold text-[#0f172a]">{streak}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">Day Streak</div>
          </div>
          <div className="rounded-3xl bg-[#f8f9fc] p-4 text-center">
            <div className="text-xl font-semibold text-[#0f172a]">{stats.avg_quiz_score ?? 0}%</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">Quiz Avg</div>
          </div>
          <div className="rounded-3xl bg-[#f8f9fc] p-4 text-center">
            <div className="text-xl font-semibold text-[#0f172a]">{stats.completion_rate ?? 0}%</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">Completion</div>
          </div>
        </div>
      </div>
    </div>
  )
}
