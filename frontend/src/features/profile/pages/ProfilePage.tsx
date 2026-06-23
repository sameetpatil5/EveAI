import { useMemo } from 'react'
import { useProfileQuery } from '../profile.queries'
import AccountSection from '../components/AccountSection'
import HobbiesSection from '../components/HobbiesSection'
import SubjectsSection from '../components/SubjectsSection'
import PreferencesSection from '../components/PreferencesSection'
import { Spinner } from '@/components/ui/Spinner'

export default function ProfilePage() {
  const profileQuery = useProfileQuery()

  if (profileQuery.isLoading) {
    return <div className="p-6"><Spinner /></div>
  }

  if (profileQuery.isError) {
    return (
      <div className="p-6">
        <div className="text-[#991b1b] font-semibold">Error loading profile</div>
        <div className="text-sm text-[#475569] mt-2">{String(profileQuery.error?.message || profileQuery.error || 'Unknown error')}</div>
        <pre className="mt-4 bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(profileQuery.error, null, 2)}
        </pre>
      </div>
    )
  }

  const data = profileQuery.data

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-[#475569]">No profile data returned from server.</div>
        <pre className="mt-4 bg-gray-100 p-2 text-xs overflow-auto">
          data: {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  if (!data.profile) {
    return (
      <div className="p-6">
        <div className="text-[#475569]">Profile data structure incomplete (missing profile object).</div>
        <pre className="mt-4 bg-gray-100 p-2 text-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    )
  }

  const hobbies = data?.hobbies ?? []
  const subjects = data?.subjects ?? []
  const profileData = data.profile

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#0f172a]">Profile & Settings</h1>
        <p className="mt-2 text-sm text-[#64748b]">Update your account, interests, study preferences, and subject priorities.</p>
      </div>

      <div className="space-y-6">
        <AccountSection profile={data} />
        <HobbiesSection hobbies={hobbies} />
        <SubjectsSection subjects={subjects} />
        <PreferencesSection available_time_slots={profileData.available_time_slots ?? []} />
      </div>
    </div>
  )
}

