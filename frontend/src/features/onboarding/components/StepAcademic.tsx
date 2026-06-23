import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ACADEMIC_LEVELS } from '@/lib/constants'
import { saveAcademic } from '../onboarding.api'
import type { AcademicInfo } from '../onboarding.types'

interface StepAcademicProps {
  onNext: () => void
}

export default function StepAcademic({ onNext }: StepAcademicProps) {
  const [academicLevel, setAcademicLevel] = useState(ACADEMIC_LEVELS[0])
  const [major, setMajor] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const mutation = useMutation({
    mutationFn: (data: AcademicInfo) => saveAcademic(data),
    onSuccess: () => onNext(),
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save academic info.')
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (!major.trim()) {
      setErrorMessage('Please enter your major.')
      return
    }

    mutation.mutate({ academic_level: academicLevel, major: major.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[#475569]">Academic level</label>
        <select
          value={academicLevel}
          onChange={(event) => setAcademicLevel(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10"
        >
          {ACADEMIC_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Major"
        value={major}
        onChange={(event) => setMajor(event.target.value)}
        placeholder="Enter your major"
        required
      />

      {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}

      <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
        {mutation.status === 'pending' ? 'Saving academic info…' : 'Continue'}
      </Button>
    </form>
  )
}
