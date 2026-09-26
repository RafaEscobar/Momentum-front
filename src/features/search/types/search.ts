import type { ProjectNoteSummary } from '@/features/notes/types'
import type { ProjectSummary } from '@/features/projects/types'
import type { TaskSummary } from '@/features/tasks/types'

export interface SearchPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface GlobalSearchResponse {
  projects: ProjectSummary[]
  tasks: TaskSummary[]
  notes: ProjectNoteSummary[]
  meta: {
    projects: SearchPaginationMeta
    tasks: SearchPaginationMeta
    notes: SearchPaginationMeta
  }
}

export interface GlobalSearchParams {
  q: string
  projects_page?: number
  tasks_page?: number
  notes_page?: number
}
