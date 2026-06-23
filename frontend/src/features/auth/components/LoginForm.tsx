import { useState, type FormEvent } from 'react'
import { useLoginMutation } from '../auth.queries'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const mutation = useLoginMutation()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')

    mutation.mutate(
      { email, password },
      {
        onError: (error) => {
          setErrorMessage(error.message || 'Login failed')
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-[#e9eaf2] bg-white px-8 py-10 shadow-sm">
      <h1 className="mb-6 text-2xl font-semibold text-[#0f172a]">Login to EveAI</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
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
        {errorMessage ? <p className="text-sm text-[#991b1b]">{errorMessage}</p> : null}
        <Button type="submit" className="w-full" disabled={mutation.status === 'pending'}>
          {mutation.status === 'pending' ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p className="mt-6 text-sm text-[#64748b]">
        Don't have an account?{' '}
        <a href="/auth/register" className="font-medium text-[#607afb] hover:text-[#4f63df]">
          Register
        </a>
      </p>
    </div>
  )
}
