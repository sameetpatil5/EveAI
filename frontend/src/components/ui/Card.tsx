import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-[#e9eaf2] bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}
