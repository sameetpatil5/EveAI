import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
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

  const displayedHobbies = localHobbies.length > 0 ? localHobbies : ['[Reading]', '[Basketball]', '[Piano]']

  return (
    <div className="rounded-[10px] border border-[#e9eaf2] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.02em] text-[#0f172a]">Hobbies</div>
        </div>
        <Button variant="secondary" onClick={() => setEditing((current) => !current)}>
          {editing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayedHobbies.map((hobby, index) => (
          <div key={`${hobby}-${index}`} className="flex items-center gap-2 rounded-full border border-[#e9eaf2] bg-[#f8f9fc] px-3 py-1 text-sm font-medium text-[#475569]">
            <span>{hobby}</span>
            {editing && localHobbies.length > 0 ? (
              <button type="button" onClick={() => removeHobby(index)} className="text-[#991b1b]">
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-lg border border-[#e9eaf2] px-4 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a hobby"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={addHobby}>
              Add
            </Button>
            <Button type="button" onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

