import { useState } from 'react'

type FormState = {
  name: string
  email: string
  subject: string
  message: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

const CONTACT_DETAILS = [
  {
    icon: '✉️',
    label: 'Email us',
    value: 'teameveai@gmail.com',
    href: 'mailto:teameveai@gmail.com',
  },
  {
    icon: '🐙',
    label: 'GitHub repo',
    value: 'EveAI',
    href: 'https://github.com/sameetpatil5/EveAI',
  },
  {
    icon: '📍',
    label: 'Based in',
    value: 'Pune, Maharashtra, India',
    href: null,
  },
]

const SUBJECTS = [
  'General enquiry',
  'Bug report',
  'Feature request',
  'Academic / Research collaboration',
  'Other',
]

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errors, setErrors] = useState<Partial<FormState>>({})

  const validate = (): boolean => {
    const next: Partial<FormState> = {}
    if (!form.name.trim()) next.name = 'Name is required.'
    if (!form.email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (!form.subject) next.subject = 'Please choose a subject.'
    if (!form.message.trim()) next.message = 'Message cannot be empty.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormState]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('loading')

    await new Promise((res) => setTimeout(res, 1200))
    setStatus('success')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="hide-scrollbar h-full overflow-y-auto bg-[#f8fafc] px-4 py-8 text-slate-900">
      <section className="mx-auto w-full max-w-6xl">
        <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-12 text-center shadow-sm sm:px-14">
          <span className="inline-block rounded-full border border-[#e0e3ff] bg-[#eef0ff] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#607afb]">
            Get in Touch
          </span>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            We'd love to hear from you
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#64748b] sm:text-base">
            Whether you have a question about EveAI, want to report a bug, or are interested in a research collaboration
            — our team is ready to help.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-6 w-full max-w-6xl">
        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="rounded-[32px] border border-[#e9eaf2] bg-white px-8 py-8 shadow-sm">
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef0ff] text-2xl">✅</div>
                <h2 className="mt-4 text-lg font-semibold text-[#0f172a]">Message sent!</h2>
                <p className="mt-2 text-sm text-[#64748b]">
                  Thanks for reaching out. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-6 rounded-2xl border border-[#e9eaf2] px-5 py-2 text-sm font-medium text-[#0f172a] transition hover:bg-slate-50"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <h2 className="text-base font-semibold text-[#0f172a]">Send us a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#475569]">Full name</label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#607afb]/20 ${
                        errors.name ? 'border-red-400' : 'border-[#e9eaf2]'
                      }`}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[#475569]">Email address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#607afb]/20 ${
                        errors.email ? 'border-red-400' : 'border-[#e9eaf2]'
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#475569]">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-[#0f172a] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#607afb]/20 ${
                      errors.subject ? 'border-red-400' : 'border-[#e9eaf2]'
                    }`}
                  >
                    <option value="">Select a subject…</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#475569]">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us what's on your mind…"
                    className={`w-full resize-none rounded-2xl border px-4 py-2.5 text-sm text-[#0f172a] placeholder-[#94a3b8] outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#607afb]/20 ${
                      errors.message ? 'border-red-400' : 'border-[#e9eaf2]'
                    }`}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
                </div>

                {status === 'error' && (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={status === 'loading'}
                  className="self-start rounded-2xl bg-[#607afb] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4f63df] disabled:opacity-60"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] border border-[#e9eaf2] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-[#0f172a]">Other ways to reach us</h2>
              <div className="mt-4 flex flex-col gap-4">
                {CONTACT_DETAILS.map((c) => (
                  <div key={c.label} className="flex gap-3">
                    <span className="text-lg">{c.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-[#475569]">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="text-sm font-medium text-[#607afb] hover:underline"
                          target={c.href.startsWith('http') ? '_blank' : undefined}
                          rel="noreferrer"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#0f172a]">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e9eaf2] bg-[#eef0ff] p-6 shadow-sm">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#607afb]/10 text-base">⏱️</div>
              <h2 className="text-sm font-semibold text-[#0f172a]">Response time</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                We typically reply within 24–48 hours on weekdays. For urgent issues, please mention it in your subject
                line.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#e9eaf2] bg-white p-6 shadow-sm">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef0ff] text-base">🔬</div>
              <h2 className="text-sm font-semibold text-[#0f172a]">Academic collaboration</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">
                Interested in researching interest-driven learning or personalized AI education? We welcome collaboration
                with educators and researchers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto mt-8 w-full max-w-6xl pb-4 text-center text-xs text-[#94a3b8]">
        © {new Date().getFullYear()} EveAI. Built with ❤️ by the EveAI team.
      </footer>
    </div>
  )
}
