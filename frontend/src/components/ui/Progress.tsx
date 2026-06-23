import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-[#e9eaf2] shadow-inner', className)}>
      <div
        className="h-full rounded-full bg-[#607afb] transition-all duration-200"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}
