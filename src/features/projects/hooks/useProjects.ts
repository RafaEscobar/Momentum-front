import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { projectKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import {
  createProject,
  deleteProject,
  getProject,
  getProjectStats,
  getProjects,
  updateProject,
} from '@/features/projects/api/projectsApi'
import type { ProjectFilters } from '@/features/projects/api/projectsApi'
import type {
  CreateProjectPayload,
  Project,
  ProjectSummary,
  ProjectStats,
  UpdateProjectPayload,
} from '@/features/projects/types'

const projectCache = {
  listStaleTime: 30_000,
  detailStaleTime: 60_000,
  gcTime: 5 * 60_000,
}

interface UpdateProjectVariables {
  projectId: number
  payload: UpdateProjectPayload
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery<PaginatedResponse<ProjectSummary>, ApiError>({
    queryKey: projectKeys.list(filters),
    queryFn: ({ signal }) => getProjects(filters, { signal }),
    placeholderData: keepPreviousData,
    staleTime: projectCache.listStaleTime,
    gcTime: projectCache.gcTime,
  })
}

export function useProject(projectId: number) {
  return useQuery<Project, ApiError>({
    queryKey: projectKeys.detail(projectId),
    queryFn: ({ signal }) => getProject(projectId, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: projectCache.detailStaleTime,
    gcTime: projectCache.gcTime,
  })
}

export function useProjectStats(projectId: number) {
  return useQuery<ProjectStats, ApiError>({
    queryKey: projectKeys.stats(projectId),
    queryFn: ({ signal }) => getProjectStats(projectId, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: projectCache.listStaleTime,
    gcTime: projectCache.gcTime,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation<Project, ApiError, CreateProjectPayload>({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project)
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation<Project, ApiError, UpdateProjectVariables>({
    mutationFn: ({ projectId, payload }) => updateProject(projectId, payload),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project)
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, number>({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) })
      void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
