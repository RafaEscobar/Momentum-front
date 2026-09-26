import type { CompleteSprintResponse } from '@/features/sprints/api/sprintsApi'
import type { UnfinishedAction } from '@/features/sprints/types'

export function sprintCompletionMessage(
  result: CompleteSprintResponse,
  action: UnfinishedAction,
  nextSprintName?: string,
) {
  const moved = result.moved_tasks.length
  const destination = action === 'backlog' ? 'al Backlog' : `a ${nextSprintName ?? 'otro Sprint'}`
  return `${result.summary.completed_points} / ${result.summary.planned_points} puntos completados · ${moved} ${moved === 1 ? 'tarea movida' : 'tareas movidas'} ${destination}`
}
