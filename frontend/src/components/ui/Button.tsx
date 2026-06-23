import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
  default: 'bg-[#607afb] text-white hover:bg-[#4f63df] border-transparent',
  secondary: 'bg-white text-[#0f172a] border border-[#e9eaf2] hover:bg-slate-50',
  ghost: 'bg-transparent text-[#0f172a] hover:bg-slate-100',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#607afb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
