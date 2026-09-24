import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
      <div className="text-zinc-400">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold text-zinc-950">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
