import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/api/errors'
import { backlogKeys, boardKeys, projectKeys, taskKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import {
  createTask,
  changeTaskStatus,
  changeTaskSprint,
  deleteTask,
  getTask,
  getTasks,
  updateTask,
} from '@/features/tasks/api/tasksApi'
import type { TaskFilters } from '@/features/tasks/api/tasksApi'
import type {
  CreateTaskPayload,
  Task,
  TaskSummary,
  UpdateTaskPayload,
  TaskStatus,
} from '@/features/tasks/types'

const taskCache = {
  listStaleTime: 15_000,
  detailStaleTime: 30_000,
  gcTime: 5 * 60_000,
}

interface CreateTaskVariables {
  projectId: number
  payload: CreateTaskPayload
}

interface UpdateTaskVariables {
  projectId: number
  taskId: number
  payload: UpdateTaskPayload
}

interface DeleteTaskVariables {
  projectId: number
  taskId: number
}

interface ChangeTaskSprintVariables {
  projectId: number
  taskId: number
  sprintId: number | null
}

interface ChangeTaskStatusVariables {
  projectId: number
  taskId: number
  status: TaskStatus
}

function invalidateTaskCollections(queryClient: ReturnType<typeof useQueryClient>, projectId: number) {
  void queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) })
  void queryClient.invalidateQueries({ queryKey: backlogKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
}

function cacheTask(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: number,
  task: Task,
) {
  queryClient.setQueryData<Task>(taskKeys.detail(projectId, task.id), (current) => ({
    ...current,
    ...task,
    tags: task.tags ?? current?.tags,
    checklist: task.checklist ?? current?.checklist,
  }))
}

export function useTasks(projectId: number, filters: TaskFilters = {}) {
  return useQuery<PaginatedResponse<TaskSummary>, ApiError>({
    queryKey: taskKeys.list(projectId, filters),
    queryFn: ({ signal }) => getTasks(projectId, filters, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    placeholderData: keepPreviousData,
    staleTime: taskCache.listStaleTime,
    gcTime: taskCache.gcTime,
  })
}

export function useTask(projectId: number, taskId: number) {
  return useQuery<Task, ApiError>({
    queryKey: taskKeys.detail(projectId, taskId),
    queryFn: ({ signal }) => getTask(projectId, taskId, { signal }),
    enabled:
      Number.isInteger(projectId) && projectId > 0 && Number.isInteger(taskId) && taskId > 0,
    staleTime: taskCache.detailStaleTime,
    gcTime: taskCache.gcTime,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation<Task, ApiError, CreateTaskVariables>({
    mutationFn: ({ projectId, payload }) => createTask(projectId, payload),
    onSuccess: (task, { projectId }) => {
      cacheTask(queryClient, projectId, task)
      invalidateTaskCollections(queryClient, projectId)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation<Task, ApiError, UpdateTaskVariables>({
    mutationFn: ({ projectId, taskId, payload }) => updateTask(projectId, taskId, payload),
    onSuccess: (task, { projectId }) => {
      cacheTask(queryClient, projectId, task)
      invalidateTaskCollections(queryClient, projectId)
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, DeleteTaskVariables>({
    mutationFn: ({ projectId, taskId }) => deleteTask(projectId, taskId),
    onSuccess: (_, { projectId, taskId }) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(projectId, taskId) })
      invalidateTaskCollections(queryClient, projectId)
    },
  })
}

export function useChangeTaskSprint() {
  const queryClient = useQueryClient()

  return useMutation<Task, ApiError, ChangeTaskSprintVariables>({
    mutationFn: ({ projectId, taskId, sprintId }) =>
      changeTaskSprint(projectId, taskId, sprintId),
    onSuccess: (task, { projectId }) => {
      cacheTask(queryClient, projectId, task)
      invalidateTaskCollections(queryClient, projectId)
    },
  })
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation<Task, ApiError, ChangeTaskStatusVariables>({
    mutationFn: ({ projectId, taskId, status }) => changeTaskStatus(projectId, taskId, status),
    onSuccess: (task, { projectId }) => {
      cacheTask(queryClient, projectId, task)
      invalidateTaskCollections(queryClient, projectId)
    },
    onError: (error) => toast.error(error.message),
  })
}
