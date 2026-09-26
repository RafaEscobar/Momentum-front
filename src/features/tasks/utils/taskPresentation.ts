import type { BadgeVariant } from '@/components/common/Badge'
import type { Priority } from '@/features/projects/types'
import type { TaskType } from '@/features/tasks/types'

export const taskTypeLabels: Record<TaskType, string> = {
  story: 'Historia',
  task: 'Tarea',
  bug: 'Bug',
  improvement: 'Mejora',
}

export const taskTypeVariants: Record<TaskType, BadgeVariant> = {
  story: 'info',
  task: 'neutral',
  bug: 'danger',
  improvement: 'success',
}

export const taskPriorityLabels: Record<Priority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}

export const taskPriorityVariants: Record<Priority, BadgeVariant> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}
