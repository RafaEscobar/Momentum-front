export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface ProjectSummary {
  id: number
  name: string
  status: ProjectStatus
  priority: Priority
  color: string | null
  icon: string | null
  progress: number
  tasks_count?: number
  created_at: string
  updated_at: string
}

export interface Project extends ProjectSummary {
  description: string | null
  start_date: string | null
  target_date: string | null
}

export interface CreateProjectPayload {
  name: string
  description?: string | null
  status?: ProjectStatus
  priority?: Priority
  color?: string
  icon?: string | null
  start_date?: string | null
  target_date?: string | null
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>

export interface ProjectStats {
  progress: number
  story_points: {
    total: number
    completed: number
  }
  tasks: {
    total: number
    backlog: number
    todo: number
    in_progress: number
    blocked: number
    done: number
  }
  active_sprint: {
    id: number
    project_id: number
    name: string
    start_date: string | null
    end_date: string | null
    status: 'active'
    planned_points: number
    completed_points: number
    progress_percentage: number
    completed_at: null
  } | null
}
