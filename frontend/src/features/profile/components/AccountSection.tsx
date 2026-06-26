import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUpdateProfileMutation } from '../profile.queries'
import type { Profile } from '../profile.types'

export default function AccountSection({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(profile?.profile?.full_name || '')
  const [academicLevel, setAcademicLevel] = useState(profile?.profile?.academic_level || '')
  const [major, setMajor] = useState(profile?.profile?.major || '')
  const mutation = useUpdateProfileMutation()

  useEffect(() => {
    setFullName(profile?.profile?.full_name || '')
    setAcademicLevel(profile?.profile?.academic_level || '')
    setMajor(profile?.profile?.major || '')
  }, [profile])

  const handleSave = async () => {
    await mutation.mutateAsync({ full_name: fullName, academic_level: academicLevel, major })
    setEditing(false)
  }

  const displayName = fullName.trim() || '[Student Name]'
  const displayEmail = profile?.user?.email?.trim() || '[Email]'
  const displayAcademicLevel = academicLevel.trim() || '[Department]'
  const displayMajor = major.trim() || '[Major]'
  const memberSince = '[January 2025]'

  return (
    <div className="rounded-[10px] border border-[#e9eaf2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.02em] text-[#0f172a]">Personal Information</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#475569]">Full Name</label>
            <input
              className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-[#475569]">Email</label>
            <input className="mt-2 w-full rounded-lg border border-[#e9eaf2] bg-[#f8fafc] px-4 py-2" value={displayEmail} disabled />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-[#475569]">Academic Level</label>
              <input
                className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-[#475569]">Major</label>
              <input
                className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="flex items-start border-b border-[#e9eaf2] py-2.5">
            <div className="w-[110px] flex-shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#94a3b8]">Full Name</div>
            <div className="text-[13px] font-medium text-[#0f172a]">{displayName}</div>
          </div>
          <div className="flex items-start border-b border-[#e9eaf2] py-2.5">
            <div className="w-[110px] flex-shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#94a3b8]">Email</div>
            <div className="text-[13px] font-medium text-[#0f172a]">{displayEmail}</div>
          </div>
          <div className="flex items-start border-b border-[#e9eaf2] py-2.5">
            <div className="w-[110px] flex-shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#94a3b8]">Academic Level</div>
            <div className="text-[13px] font-medium text-[#0f172a]">{displayAcademicLevel}</div>
          </div>
          <div className="flex items-start border-b border-[#e9eaf2] py-2.5">
            <div className="w-[110px] flex-shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#94a3b8]">Major</div>
            <div className="text-[13px] font-medium text-[#0f172a]">{displayMajor}</div>
          </div>
          <div className="flex items-start py-2.5">
            <div className="w-[110px] flex-shrink-0 text-[12px] uppercase tracking-[0.04em] text-[#94a3b8]">Member Since</div>
            <div className="text-[13px] font-medium text-[#0f172a]">{memberSince}</div>
          </div>
        </div>
      )}
    </div>
  )
}

