import type { PropsWithChildren } from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'info' | 'danger'

interface BadgeProps extends PropsWithChildren {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  neutral: 'bg-zinc-100 text-zinc-700',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  info: 'bg-sky-50 text-sky-800',
  danger: 'bg-red-50 text-red-800',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]}`}>{children}</span>
}
