import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { ApiResourceResponse, PaginatedResponse } from '@/api/types'
import type { Priority } from '@/features/projects/types'
import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
  TaskSummary,
  TaskType,
  UpdateTaskPayload,
} from '@/features/tasks/types'

export interface TaskFilters {
  page?: number
  status?: TaskStatus
  priority?: Priority
  type?: TaskType
  sprint_id?: number
  tag_id?: number
  search?: string
}

export interface ReorderTaskInput {
  id: number
  status: TaskStatus
  position: number
}

function tasksEndpoint(projectId: number) {
  return `/projects/${projectId}/tasks`
}

function taskEndpoint(projectId: number, taskId: number) {
  return `${tasksEndpoint(projectId)}/${taskId}`
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters = {},
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<TaskSummary>> {
  const { data } = await api.get<PaginatedResponse<TaskSummary>>(tasksEndpoint(projectId), {
    ...options,
    params: {
      ...filters,
      search: filters.search?.trim() || undefined,
    },
  })

  return data
}

export async function getTask(
  projectId: number,
  taskId: number,
  options?: ApiRequestOptions,
): Promise<Task> {
  const { data } = await api.get<ApiResourceResponse<Task>>(
    taskEndpoint(projectId, taskId),
    options,
  )

  return data.data
}

export async function createTask(
  projectId: number,
  payload: CreateTaskPayload,
): Promise<Task> {
  const { data } = await api.post<ApiResourceResponse<Task>>(tasksEndpoint(projectId), payload)

  return data.data
}

export async function updateTask(
  projectId: number,
  taskId: number,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { data } = await api.patch<ApiResourceResponse<Task>>(
    taskEndpoint(projectId, taskId),
    payload,
  )

  return data.data
}

export async function deleteTask(projectId: number, taskId: number): Promise<void> {
  await api.delete(taskEndpoint(projectId, taskId))
}

export async function changeTaskSprint(
  projectId: number,
  taskId: number,
  sprintId: number | null,
): Promise<Task> {
  const { data } = await api.patch<ApiResourceResponse<Task>>(
    `${taskEndpoint(projectId, taskId)}/sprint`,
    { sprint_id: sprintId },
  )

  return data.data
}

export async function changeTaskStatus(
  projectId: number,
  taskId: number,
  status: TaskStatus,
): Promise<Task> {
  const { data } = await api.patch<ApiResourceResponse<Task>>(
    `${taskEndpoint(projectId, taskId)}/status`,
    { status },
  )
  return data.data
}

export async function reorderTasks(
  projectId: number,
  tasks: ReorderTaskInput[],
): Promise<TaskSummary[]> {
  const { data } = await api.patch<ApiResourceResponse<TaskSummary[]> | TaskSummary[]>(
    `${tasksEndpoint(projectId)}/reorder`,
    { tasks },
  )

  return Array.isArray(data) ? data : data.data
}
