import { useEffect, useRef } from 'react'
import type { TutorMessage } from '../tutor.types'
import { TutorMessageBubble } from './TutorMessageBubble'

interface TutorMessageListProps {
  messages: TutorMessage[]
  isLoading?: boolean
}

export function TutorMessageList({ messages, isLoading }: TutorMessageListProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    ref.current.scrollTop = ref.current.scrollHeight
  }, [messages, isLoading])

  return (
    <div ref={ref} className="flex h-full min-h-0 flex-col overflow-y-auto space-y-3 p-4">
      {messages.map((m, idx) => (
        <TutorMessageBubble key={idx} message={m} />
      ))}
      {isLoading ? (
        <div className="flex justify-start">
          <div className="rounded-2xl bg-[#f1f5f9] px-3 py-2 text-sm">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#94a3b8]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#94a3b8]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#94a3b8]" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
