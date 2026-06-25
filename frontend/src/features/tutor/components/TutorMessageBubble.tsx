import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TutorMessage } from '../tutor.types'

export function TutorMessageBubble({ message }: { message: TutorMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${isUser ? 'bg-[#607afb] text-white' : 'bg-[#f1f5f9] text-[#0f172a]'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      </div>
    </div>
  )
}
