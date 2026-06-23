import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles: Record<string, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2.5',
  lg: 'h-12 w-12 border-4',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent text-[#607afb]',
        sizeStyles[size],
        className,
      )}
    />
  )
}
