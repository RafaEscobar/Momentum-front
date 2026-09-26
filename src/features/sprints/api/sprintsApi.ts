import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { PaginatedResponse } from '@/api/types'
import type { ApiResourceResponse } from '@/api/types'
import type { CreateSprintPayload, Sprint, SprintStatus, SprintSummary, UpdateSprintPayload } from '@/features/sprints/types/sprint'

export interface SprintFilters {
  page?: number
  status?: SprintStatus
  search?: string
}

export async function getSprints(
  projectId: number,
  filters: SprintFilters = {},
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<SprintSummary>> {
  const { data } = await api.get<PaginatedResponse<SprintSummary>>(
    `/projects/${projectId}/sprints`,
    {
      ...options,
      params: { ...filters, search: filters.search?.trim() || undefined },
    },
  )

  return data
}

function sprintEndpoint(projectId: number, sprintId: number) {
  return `/projects/${projectId}/sprints/${sprintId}`
}

export async function getSprint(projectId: number, sprintId: number, options?: ApiRequestOptions): Promise<Sprint> {
  const { data } = await api.get<ApiResourceResponse<Sprint>>(sprintEndpoint(projectId, sprintId), options)
  return data.data
}

export async function createSprint(projectId: number, payload: CreateSprintPayload): Promise<Sprint> {
  const { data } = await api.post<ApiResourceResponse<Sprint>>(`/projects/${projectId}/sprints`, payload)
  return data.data
}

export async function updateSprint(projectId: number, sprintId: number, payload: UpdateSprintPayload): Promise<Sprint> {
  const { data } = await api.patch<ApiResourceResponse<Sprint>>(sprintEndpoint(projectId, sprintId), payload)
  return data.data
}

export async function deleteSprint(projectId: number, sprintId: number): Promise<void> {
  await api.delete(sprintEndpoint(projectId, sprintId))
}

export async function startSprint(projectId: number, sprintId: number): Promise<Sprint> {
  const { data } = await api.post<ApiResourceResponse<Sprint>>(`${sprintEndpoint(projectId, sprintId)}/start`)
  return data.data
}
