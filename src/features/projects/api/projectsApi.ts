import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { ApiResourceResponse, PaginatedResponse } from '@/api/types'
import type {
  CreateProjectPayload,
  Priority,
  Project,
  ProjectStatus,
  ProjectStats,
  ProjectSummary,
  UpdateProjectPayload,
} from '@/features/projects/types'

export interface ProjectFilters {
  page?: number
  status?: ProjectStatus
  priority?: Priority
  search?: string
}

const projectsEndpoint = '/projects'

function projectEndpoint(projectId: number) {
  return `${projectsEndpoint}/${projectId}`
}

export async function getProjects(
  filters: ProjectFilters = {},
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<ProjectSummary>> {
  const { data } = await api.get<PaginatedResponse<ProjectSummary>>(projectsEndpoint, {
    ...options,
    params: {
      ...filters,
      search: filters.search?.trim() || undefined,
    },
  })

  return data
}

export async function getProject(
  projectId: number,
  options?: ApiRequestOptions,
): Promise<Project> {
  const { data } = await api.get<ApiResourceResponse<Project>>(projectEndpoint(projectId), options)

  return data.data
}

export async function createProject(payload: CreateProjectPayload): Promise<Project> {
  const { data } = await api.post<ApiResourceResponse<Project>>(projectsEndpoint, payload)

  return data.data
}

export async function updateProject(
  projectId: number,
  payload: UpdateProjectPayload,
): Promise<Project> {
  const { data } = await api.patch<ApiResourceResponse<Project>>(
    projectEndpoint(projectId),
    payload,
  )

  return data.data
}

export async function deleteProject(projectId: number): Promise<void> {
  await api.delete(projectEndpoint(projectId))
}

export async function getProjectStats(
  projectId: number,
  options?: ApiRequestOptions,
): Promise<ProjectStats> {
  const { data } = await api.get<ProjectStats>(`${projectEndpoint(projectId)}/stats`, options)

  return data
}
