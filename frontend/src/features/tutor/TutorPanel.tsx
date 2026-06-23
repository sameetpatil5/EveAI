import { useEffect, useState } from 'react'
import { tutorChat } from './tutor.api'
import { TutorMessageList } from './components/TutorMessageList'
import { TutorInput } from './components/TutorInput'
import type { TutorMessage } from './tutor.types'

export function TutorPanel() {
  const [messages, setMessages] = useState<TutorMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  // Try to read activeLessonId from learning store if available
  useEffect(() => {
    ;(async () => {
      try {
        const mod: any = await import('@/stores/learning.store')
        const ls: any = mod?.default ?? mod
        if (ls && ls.activeLessonId) setActiveLessonId(ls.activeLessonId)
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  useEffect(() => {
    // clear messages on lesson change
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
    <div className="flex h-full flex-col border-l border-[#e9eaf2] bg-[#f8fafc]">
      <div className="px-4 py-3 font-medium">AI Tutor</div>
      <div className="flex-1">
        {activeLessonId ? (
          <TutorMessageList messages={messages} isLoading={isLoading} />
        ) : (
          <div className="p-6 text-sm text-[#64748b]">Open a lesson to start chatting with the AI Tutor.</div>
        )}
      </div>
      <div>
        <TutorInput onSend={handleSend} disabled={!activeLessonId || isLoading} />
      </div>
    </div>
  )
}
