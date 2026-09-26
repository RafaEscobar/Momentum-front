import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { SprintSummary } from '@/features/sprints/types'
import type { BoardTask } from '@/features/tasks/types'

export interface BoardResponse {
  sprint: SprintSummary | null
  backlog: BoardTask[]
  todo: BoardTask[]
  in_progress: BoardTask[]
  blocked: BoardTask[]
  done: BoardTask[]
}

export async function getBoard(
  projectId: number,
  sprintId?: number,
  options?: ApiRequestOptions,
): Promise<BoardResponse> {
  const { data } = await api.get<BoardResponse>(`/projects/${projectId}/board`, {
    ...options,
    params: { sprint_id: sprintId },
  })

  return data
}
