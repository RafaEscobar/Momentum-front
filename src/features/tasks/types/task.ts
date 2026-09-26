import type { Priority } from '@/features/projects/types'

export type TaskType = 'story' | 'task' | 'bug' | 'improvement'

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done'

export type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13 | null

export interface Tag {
  id: number
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: number
  task_id: number
  title: string
  is_completed: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface TaskSummary {
  id: number
  project_id: number
  sprint_id: number | null
  title: string
  type: TaskType
  priority: Priority
  status: TaskStatus
  story_points: StoryPoints
  position: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Task extends TaskSummary {
  description: string | null
  tags?: Tag[]
  checklist?: ChecklistItem[]
}

export interface BacklogTask extends TaskSummary {
  tags?: Tag[]
}

export interface BoardTask extends TaskSummary {
  tags?: Tag[]
  checklist: {
    total: number
    completed: number
  }
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  type?: TaskType
  priority?: Priority
  status?: TaskStatus
  story_points?: StoryPoints
  sprint_id?: number | null
  position?: number
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>
