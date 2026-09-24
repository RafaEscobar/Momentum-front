import type { BadgeVariant } from '@/components/common/Badge'
import type { Priority, ProjectStatus } from '@/features/projects/types'

export const projectStatusLabels: Record<ProjectStatus, string> = {
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado',
  archived: 'Archivado',
}

export const projectStatusVariants: Record<ProjectStatus, BadgeVariant> = {
  active: 'success',
  paused: 'warning',
  completed: 'info',
  archived: 'neutral',
}

export const priorityLabels: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export const priorityClasses: Record<Priority, string> = {
  low: 'text-zinc-600',
  medium: 'text-blue-700',
  high: 'text-orange-700',
  critical: 'text-red-700',
}
