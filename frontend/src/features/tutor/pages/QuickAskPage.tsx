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
  const [input, setInput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const isEmptyChat = messages.length === 1 && messages[0]?.id === 'welcome'

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: (message: string) => quickAsk(message),
    onSuccess: (data) => {
      setMessages((m) =>
        m.map((msg) =>
          msg.text === '...' ? { ...msg, text: data.response } : msg
        )
      )
    },
    onError: () => {
      setMessages((m) =>
        m.map((msg) =>
          msg.text === '...'
            ? { ...msg, text: 'Sorry, something went wrong while generating response.' }
            : msg
        )
      )
      setError('Failed to send message. Try again.')
    },
  })

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || mutation.status === 'pending') return

    setError('')
    setInput('')

    const userId = `user-${Date.now()}`
    const aiId = `ai-${Date.now()}`

    setMessages((prev) => [...prev, { id: userId, sender: 'user', text: trimmed }, { id: aiId, sender: 'ai', text: '...' }])

    mutation.mutate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-2">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-[#e8edf8] bg-white shadow-sm">
        {isEmptyChat && (
          <div className="border-b border-[#e8edf8] bg-[#f8fafc] px-5 py-4 text-sm text-[#475569]">
            Chat with Eve and get personalized study help any time.
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-sm ${
                    message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-[#f3f4f6] text-[#111827] rounded-bl-none'
                  }`}
                >
                  {message.sender === 'ai' ? (
                    <div className="prose prose-sm max-w-none text-left">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}

            <div ref={scrollRef} />
          </div>

          {error && <div className="border-t border-[#e8edf8] bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>}

          <div className="border-t border-[#e8edf8] bg-white px-5 py-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 rounded-2xl border border-[#d2d6e4] bg-[#f8fafc] px-4 py-3 text-sm outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff]"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={mutation.status === 'pending'}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
