import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error'
  children: React.ReactNode
}

const badgeStyles: Record<string, string> = {
  default: 'bg-slate-100 text-[#0f172a]',
  success: 'bg-[#d1fae5] text-[#047857]',
  warning: 'bg-[#fef3c7] text-[#92400e]',
  error: 'bg-[#fee2e2] text-[#991b1b]',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', badgeStyles[variant])}>
      {children}
    </span>
  )
}
