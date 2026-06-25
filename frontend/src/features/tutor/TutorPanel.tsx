import { useEffect, useState } from 'react'
import { tutorChat } from './tutor.api'
import { TutorMessageList } from './components/TutorMessageList'
import { TutorInput } from './components/TutorInput'
import { useLearningStore } from '@/stores/learning.store'
import type { TutorMessage } from './tutor.types'

export function TutorPanel() {
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const activeLessonId = useLearningStore((s) => s.activeLessonId)

  useEffect(() => {
    setMessages([])
    setSessionId(null)
  }, [activeLessonId])

  const handleSend = async (text: string) => {
    if (!activeLessonId) return
    const userMsg: TutorMessage = { role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setIsLoading(true)
    try {
      const res = await tutorChat(text, activeLessonId, sessionId ?? undefined)
      if (res?.session_id) setSessionId(res.session_id)
      const assistantMsg: TutorMessage = { role: 'assistant', content: res.response }
      setMessages((m) => [...m, assistantMsg])
    } catch (e: any) {
      const errMsg: TutorMessage = { role: 'assistant', content: 'Unable to get a response. Please try again.' }
      setMessages((m) => [...m, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f8fafc]">
      <div className="border-b border-[#e9eaf2] px-4 py-3 font-medium">AI Tutor</div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeLessonId ? (
          <TutorMessageList messages={messages} isLoading={isLoading} />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-sm text-[#64748b]">
            Open a lesson to start chatting with the AI Tutor.
          </div>
        )}
      </div>
      <div className="border-t border-[#e9eaf2] bg-white">
        <TutorInput onSend={handleSend} disabled={!activeLessonId || isLoading} />
      </div>
    </div>
  )
}
