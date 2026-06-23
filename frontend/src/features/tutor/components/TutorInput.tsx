import { useState } from 'react'

interface TutorInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function TutorInput({ onSend, disabled = false }: TutorInputProps) {
  const [text, setText] = useState('')

  const send = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="p-4">
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-3xl border border-[#e9eaf2] bg-white px-4 py-2 text-sm outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          disabled={disabled}
          placeholder="Ask the tutor about this lesson..."
        />
        <button className="rounded-3xl bg-[#607afb] px-4 py-2 text-sm text-white" onClick={send} disabled={disabled}>
          Send
        </button>
      </div>
    </div>
  )
}
