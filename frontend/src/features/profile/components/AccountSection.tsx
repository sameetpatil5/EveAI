import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold text-[#0f172a]">Account</div>
          <div className="text-sm text-[#64748b]">Manage your personal details.</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#475569]">Full Name</label>
          <input
            className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block text-sm text-[#475569]">Email</label>
          <input className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2 bg-[#f8fafc]" value={profile?.user?.email || ''} disabled />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-[#475569]">Academic Level</label>
            <input
              className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
              value={academicLevel}
              onChange={(e) => setAcademicLevel(e.target.value)}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-sm text-[#475569]">Major</label>
            <input
              className="mt-2 w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              disabled={!editing}
            />
          </div>
        </div>
        {editing ? (
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

