import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { PaginatedResponse, PaginationMeta } from '@/api/types'
import type { Priority } from '@/features/projects/types'
import type { BacklogTask, TaskType } from '@/features/tasks/types'

export interface BacklogFilters {
  page?: number
  priority?: Priority
  type?: TaskType
  search?: string
  tag_ids?: number[]
}

export interface BacklogMeta extends PaginationMeta {
  story_points_total: number
}

export type BacklogResponse = PaginatedResponse<BacklogTask, BacklogMeta>

export async function getBacklog(
  projectId: number,
  filters: BacklogFilters = {},
  options?: ApiRequestOptions,
): Promise<BacklogResponse> {
  const { data } = await api.get<BacklogResponse>(`/projects/${projectId}/backlog`, {
    ...options,
    params: {
      ...filters,
      search: filters.search?.trim() || undefined,
    },
  })

  return data
}
