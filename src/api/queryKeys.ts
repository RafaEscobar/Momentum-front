import type { ProjectFilters } from '@/features/projects/api/projectsApi'
import type { BacklogFilters } from '@/features/tasks/api/backlogApi'
import type { TaskFilters } from '@/features/tasks/api/tasksApi'
import type { SprintFilters } from '@/features/sprints/api/sprintsApi'
import type { ActivityFilters } from '@/features/activity/api/activityApi'
import type { GlobalSearchParams } from '@/features/search/types'

function normalizeProjectFilters(filters: ProjectFilters) {
  return {
    page: filters.page ?? 1,
    status: filters.status ?? null,
    priority: filters.priority ?? null,
    search: filters.search?.trim() || null,
  }
}

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: ProjectFilters = {}) =>
    [...projectKeys.lists(), normalizeProjectFilters(filters)] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (projectId: number) => [...projectKeys.details(), projectId] as const,
  stats: (projectId: number) => [...projectKeys.detail(projectId), 'stats'] as const,
}

function normalizeTaskFilters(filters: TaskFilters) {
  return {
    page: filters.page ?? 1,
    status: filters.status ?? null,
    priority: filters.priority ?? null,
    type: filters.type ?? null,
    sprint_id: filters.sprint_id ?? null,
    tag_id: filters.tag_id ?? null,
    search: filters.search?.trim() || null,
  }
}

export const taskKeys = {
  all: (projectId: number) => ['projects', projectId, 'tasks'] as const,
  lists: (projectId: number) => [...taskKeys.all(projectId), 'list'] as const,
  list: (projectId: number, filters: TaskFilters = {}) =>
    [...taskKeys.lists(projectId), normalizeTaskFilters(filters)] as const,
  details: (projectId: number) => [...taskKeys.all(projectId), 'detail'] as const,
  detail: (projectId: number, taskId: number) =>
    [...taskKeys.details(projectId), taskId] as const,
}

function normalizeBacklogFilters(filters: BacklogFilters) {
  return {
    page: filters.page ?? 1,
    priority: filters.priority ?? null,
    type: filters.type ?? null,
    search: filters.search?.trim() || null,
    tag_ids: [...(filters.tag_ids ?? [])].sort((a, b) => a - b),
  }
}

export const backlogKeys = {
  all: (projectId: number) => ['projects', projectId, 'backlog'] as const,
  list: (projectId: number, filters: BacklogFilters = {}) =>
    [...backlogKeys.all(projectId), normalizeBacklogFilters(filters)] as const,
}

function normalizeSprintFilters(filters: SprintFilters) {
  return {
    page: filters.page ?? 1,
    status: filters.status ?? null,
    search: filters.search?.trim() || null,
  }
}

export const sprintKeys = {
  all: (projectId: number) => ['projects', projectId, 'sprints'] as const,
  lists: (projectId: number) => [...sprintKeys.all(projectId), 'list'] as const,
  list: (projectId: number, filters: SprintFilters = {}) =>
    [...sprintKeys.lists(projectId), normalizeSprintFilters(filters)] as const,
  details: (projectId: number) => [...sprintKeys.all(projectId), 'detail'] as const,
  detail: (projectId: number, sprintId: number) =>
    [...sprintKeys.details(projectId), sprintId] as const,
}

export const tagKeys = {
  all: ['tags'] as const,
}

export const boardKeys = {
  all: (projectId: number) => ['projects', projectId, 'board'] as const,
  detail: (projectId: number, sprintId?: number) =>
    [...boardKeys.all(projectId), { sprint_id: sprintId ?? null }] as const,
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
}

function normalizeActivityFilters(filters: ActivityFilters) {
  return {
    page: filters.page ?? 1,
    type: filters.type ?? null,
    date_from: filters.date_from ?? null,
    date_to: filters.date_to ?? null,
  }
}

export const activityKeys = {
  all: (projectId: number) => ['projects', projectId, 'activities'] as const,
  list: (projectId: number, filters: ActivityFilters = {}) =>
    [...activityKeys.all(projectId), normalizeActivityFilters(filters)] as const,
}

export const noteKeys = {
  all: (projectId: number) => ['projects', projectId, 'notes'] as const,
  lists: (projectId: number) => [...noteKeys.all(projectId), 'list'] as const,
  list: (projectId: number, page = 1) => [...noteKeys.lists(projectId), { page }] as const,
  details: (projectId: number) => [...noteKeys.all(projectId), 'detail'] as const,
  detail: (projectId: number, noteId: number) =>
    [...noteKeys.details(projectId), noteId] as const,
}

function normalizeSearchParams(params: GlobalSearchParams) {
  return {
    q: params.q.trim(),
    projects_page: params.projects_page ?? 1,
    tasks_page: params.tasks_page ?? 1,
    notes_page: params.notes_page ?? 1,
  }
}

export const searchKeys = {
  all: ['search'] as const,
  results: (params: GlobalSearchParams) =>
    [...searchKeys.all, normalizeSearchParams(params)] as const,
}
