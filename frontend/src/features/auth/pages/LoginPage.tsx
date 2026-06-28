import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-start justify-center bg-[#f8f9fc] px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl">
        <LoginForm />
      </div>
    </div>
  )
}
