import { type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: LucideIcon
  heading: string
  subtext?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, heading, subtext, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-[#e9eaf2] bg-white p-10 text-center shadow-sm">
      <div className="space-y-4">
        {Icon ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2ff] text-[#4f63df]">
            <Icon size={28} />
          </div>
        ) : null}
        <div className="text-xl font-semibold text-[#0f172a]">{heading}</div>
        {subtext ? <p className="text-sm text-[#64748b]">{subtext}</p> : null}
        {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
      </div>
    </div>
  )
}
