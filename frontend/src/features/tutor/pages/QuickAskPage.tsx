import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { quickAsk } from '@/features/tutor/tutor.api'

type Message = { id: string; sender: 'user' | 'ai'; text: string }

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'ai',
  text: "Hi! I'm Eve, your study tutor. What questions or doubts are you working on today?",
}

export default function QuickAskPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const isEmptyChat = messages.length === 1 && messages[0]?.id === 'welcome'

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: (message: string) => quickAsk(message),
  })

  const isPending = mutation.status === 'pending'

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isPending) return

    setError('')
    setInput('')

    const userId = `user-${Date.now()}`
    const aiId = `ai-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      { id: userId, sender: 'user', text: trimmed },
      { id: aiId, sender: 'ai', text: 'Thinking…' },
    ])

    mutation.mutate(trimmed, {
      onSuccess: (data) => {
        setMessages((prev) => prev.map((msg) => (msg.id === aiId ? { ...msg, text: data.response } : msg)))
      },
      onError: () => {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiId ? { ...msg, text: 'Sorry, something went wrong while generating response.' } : msg))
        )
        setError('Failed to send message. Try again.')
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-[#e9eaf2] bg-white shadow-[0_18px_45px_-24px_rgba(15,23,42,0.35)]">
        <div className="border-b border-[#e9eaf2] bg-[#f8fafc] px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-slate-900">Quick Ask</h1>
              <p className="text-sm text-slate-500">Ask Eve anything and get clear, personalized study help.</p>
            </div>
            <div className="rounded-full bg-[#607afb]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#607afb]">
              AI Tutor
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {messages.map((message) => {
                const isUser = message.sender === 'user'

                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
                        isUser
                          ? 'rounded-br-md bg-[#607afb] text-white'
                          : 'rounded-bl-md bg-[#f1f5f9] text-slate-800'
                      }`}
                    >
                      {message.sender === 'ai' ? (
                        <div className="whitespace-pre-wrap">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                        </div>
                      ) : (
                        message.text
                      )}
                    </div>
                  </div>
                )
              })}

              {isEmptyChat && (
                <div className="rounded-2xl border border-dashed border-[#dbe4ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-500">
                  Try asking about a topic, formula, or homework question and Eve will help you work through it.
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </div>

          {error && (
            <div className="border-t border-[#e9eaf2] bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-6">
              {error}
            </div>
          )}

          <div className="border-t border-[#e9eaf2] bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
                className="flex-1 rounded-2xl border border-[#dbe4ff] bg-[#f8fafc] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff] disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isPending}
                className="rounded-2xl bg-[#607afb] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f6df5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Thinking…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
