import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { backlogKeys, boardKeys, projectKeys, sprintKeys, taskKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import { createSprint, deleteSprint, getSprint, getSprints, startSprint, updateSprint } from '@/features/sprints/api/sprintsApi'
import type { SprintFilters } from '@/features/sprints/api/sprintsApi'
import type { CreateSprintPayload, Sprint, SprintSummary, UpdateSprintPayload } from '@/features/sprints/types/sprint'

export function useSprints(projectId: number, filters: SprintFilters = {}) {
  return useQuery<PaginatedResponse<SprintSummary>, ApiError>({
    queryKey: sprintKeys.list(projectId, filters),
    queryFn: ({ signal }) => getSprints(projectId, filters, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

export function useSprint(projectId: number, sprintId: number) {
  return useQuery<Sprint, ApiError>({
    queryKey: sprintKeys.detail(projectId, sprintId),
    queryFn: ({ signal }) => getSprint(projectId, sprintId, { signal }),
    enabled: projectId > 0 && sprintId > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

function invalidateSprintState(queryClient: ReturnType<typeof useQueryClient>, projectId: number) {
  void queryClient.invalidateQueries({ queryKey: sprintKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
  void queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: backlogKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) })
}

export function useCreateSprint() {
  const queryClient = useQueryClient()
  return useMutation<Sprint, ApiError, { projectId: number; payload: CreateSprintPayload }>({
    mutationFn: ({ projectId, payload }) => createSprint(projectId, payload),
    onSuccess: (sprint, { projectId }) => {
      queryClient.setQueryData(sprintKeys.detail(projectId, sprint.id), sprint)
      invalidateSprintState(queryClient, projectId)
    },
  })
}

export function useUpdateSprint() {
  const queryClient = useQueryClient()
  return useMutation<Sprint, ApiError, { projectId: number; sprintId: number; payload: UpdateSprintPayload }>({
    mutationFn: ({ projectId, sprintId, payload }) => updateSprint(projectId, sprintId, payload),
    onSuccess: (sprint, { projectId }) => {
      queryClient.setQueryData(sprintKeys.detail(projectId, sprint.id), sprint)
      invalidateSprintState(queryClient, projectId)
    },
  })
}

export function useDeleteSprint() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, { projectId: number; sprintId: number }>({
    mutationFn: ({ projectId, sprintId }) => deleteSprint(projectId, sprintId),
    onSuccess: (_, { projectId, sprintId }) => {
      queryClient.removeQueries({ queryKey: sprintKeys.detail(projectId, sprintId) })
      invalidateSprintState(queryClient, projectId)
    },
  })
}

export function useStartSprint() {
  const queryClient = useQueryClient()
  return useMutation<Sprint, ApiError, { projectId: number; sprintId: number }>({
    mutationFn: ({ projectId, sprintId }) => startSprint(projectId, sprintId),
    onSuccess: (sprint, { projectId }) => {
      queryClient.setQueryData(sprintKeys.detail(projectId, sprint.id), sprint)
      invalidateSprintState(queryClient, projectId)
    },
  })
}
