import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`

  return (
    <div className="space-y-2">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#475569]">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-[#e9eaf2] bg-white px-4 py-2 text-sm text-[#0f172a] transition duration-200 placeholder:text-[#94a3b8] focus:border-[#607afb] focus:outline-none focus:ring-2 focus:ring-[#607afb]/10',
          className,
        )}
        {...props}
      />
    </div>
  )
}
