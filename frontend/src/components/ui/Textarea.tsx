import * as React from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#475569]">
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-[120px] w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-3 text-sm text-[#0f172a] transition duration-200 placeholder:text-[#94a3b8] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10',
          className,
        )}
        {...props}
      />
    </div>
  )
}
