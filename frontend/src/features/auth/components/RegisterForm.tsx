import { useState, type FormEvent } from 'react'
import { useRegisterMutation } from '../auth.queries'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const mutation = useRegisterMutation()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      return
    }

    mutation.mutate(
      { full_name: fullName.trim(), email, password },
      {
        onError: (error) => {
          setErrorMessage(error.message || 'Registration failed')
        },
      },
    )
  }

  return (
    <div className="w-full max-w-xl rounded-[32px] border border-[#e9eaf2] bg-white p-8 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] sm:p-10">
      <div className="mb-8 space-y-3">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-[#dbe4ff] bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#607afb]">
            Create account
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-[#0f172a]">Start your learning journey with EveAI</h1>
        <p className="text-sm leading-6 text-[#64748b]">
          Build a personalized study experience with lessons, schedules, quizzes, and AI support from day one.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
          placeholder="Alex Morgan"
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="you@example.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="••••••••"
        />
        {errorMessage ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991b1b]">{errorMessage}</p> : null}
        <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6 rounded-2xl border border-[#e9eaf2] bg-[#f8fafc] px-4 py-3 text-sm text-[#475569]">
        Already have an account?{' '}
        <a href="/auth/login" className="font-semibold text-[#607afb] hover:text-[#4f63df]">
          Log in
        </a>
      </div>
    </div>
  )
}
