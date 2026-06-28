import { useProfileQuery } from '../profile.queries'
import AccountSection from '../components/AccountSection'
import HobbiesSection from '../components/HobbiesSection'
import PreferencesSection from '../components/PreferencesSection'
import SubjectsSection from '../components/SubjectsSection'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const profileQuery = useProfileQuery()

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc] p-6">
        <Spinner />
      </div>
    )
  }

  if (profileQuery.isError) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6">
        <div className="rounded-[10px] border border-[#e9eaf2] bg-white p-6">
          <div className="text-[#991b1b] font-semibold">[Error loading profile]</div>
          <div className="mt-2 text-sm text-[#475569]">{String(profileQuery.error?.message || profileQuery.error || '[Unknown error]')}</div>
          <pre className="mt-4 overflow-auto bg-gray-100 p-2 text-xs">{JSON.stringify(profileQuery.error, null, 2)}</pre>
        </div>
      </div>
    )
  }

  const data = profileQuery.data

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6">
        <div className="rounded-[10px] border border-[#e9eaf2] bg-white p-6 text-[#475569]">[No profile data returned from server.]</div>
      </div>
    )
  }

  if (!data.profile) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] p-6">
        <div className="rounded-[10px] border border-[#e9eaf2] bg-white p-6 text-[#475569]">[Profile data structure incomplete (missing profile object).]</div>
      </div>
    )
  }

  const hobbies = data?.hobbies ?? []
  const subjects = data?.subjects ?? []
  const profileData = data.profile

  const fullName = profileData.full_name?.trim() || '[Student Name]'
  const email = data.user?.email?.trim() || '[Email]'
  const academicLevel = profileData.academic_level?.trim() || '[Department]'
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'JD'
  const streakLabel = '[12-day streak]'
  const lessonsLabel = '[47 lessons completed]'

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[#f8f9fc] px-3 py-3 md:px-5 lg:px-6">
      <main className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-1 flex-col gap-4 overflow-hidden">
        <section className="mb-0 flex flex-col gap-4 rounded-[10px] border border-[#e9eaf2] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#c7d0fe] bg-[#eef2ff] text-[22px] font-bold text-[#607afb]">
              {initials}
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#0f172a]">{fullName}</h2>
              <div className="mt-1 text-sm text-[#94a3b8]">{email}</div>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-[#c7d0fe] bg-[#eef2ff] px-2.5 py-1 font-medium text-[#607afb]">
                  {academicLevel}
                </span>
                <span className="rounded-full border border-[#e9eaf2] bg-[#f8f9fc] px-2.5 py-1 font-medium text-[#475569]">
                  {streakLabel}
                </span>
                <span className="rounded-full border border-[#e9eaf2] bg-[#f8f9fc] px-2.5 py-1 font-medium text-[#475569]">
                  {lessonsLabel}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary" type="button" className="shrink-0">
            Edit
          </Button>
        </section>

        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
            <div id="account-section" className="min-h-0">
              <AccountSection profile={data} />
            </div>

            <div className="flex h-full min-h-0 flex-col gap-4">
              <HobbiesSection hobbies={hobbies} />

              <PreferencesSection available_time_slots={profileData.available_time_slots} />
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-1 flex-col">
            <SubjectsSection subjects={subjects} />
          </div>
        </div>
      </main>
    </div>
  )
}

