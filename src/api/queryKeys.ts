import type { ProjectFilters } from '@/features/projects/api/projectsApi'

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
