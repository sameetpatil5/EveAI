import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useUpdateProfileMutation } from '../profile.queries'
import type { Profile } from '../profile.types'

export default function HobbiesSection({ hobbies }: { hobbies: Profile['hobbies'] }) {
  const [editing, setEditing] = useState(false)
  const [localHobbies, setLocalHobbies] = useState<string[]>(hobbies ?? [])
  const [input, setInput] = useState('')
  const mutation = useUpdateProfileMutation()

  useEffect(() => {
    setLocalHobbies(hobbies ?? [])
  }, [hobbies])

  const addHobby = () => {
    if (!input.trim()) return
    setLocalHobbies((current) => [...current, input.trim()])
    setInput('')
  }

  const removeHobby = (index: number) => {
    setLocalHobbies((current) => current.filter((_, idx) => idx !== index))
  }

  const handleSave = async () => {
    await mutation.mutateAsync({ hobbies: localHobbies })
    setEditing(false)
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-semibold text-[#0f172a]">Hobbies</div>
          <div className="text-sm text-[#64748b]">Keep track of your interests.</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(editing ? localHobbies : hobbies).map((hobby, index) => (
            <div key={index} className="flex items-center gap-2 rounded-full border border-[#e9eaf2] bg-white px-3 py-1 text-sm text-[#0f172a]">
              <span>{hobby}</span>
              {editing ? (
                <button type="button" onClick={() => removeHobby(index)} className="text-[#991b1b]">×</button>
              ) : null}
            </div>
          ))}
        </div>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            <input
              className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a hobby"
            />
            <Button onClick={addHobby}>Add</Button>
          </div>
        ) : null}
        {editing ? (
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

