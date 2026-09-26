import type { ProjectSummary } from '@/features/projects/types'
import type { SprintSummary } from '@/features/sprints/types'
import type { Activity } from '@/features/activity/types'

export interface DashboardSummary {
  active_projects: number
  planned_story_points: number
  completed_story_points: number
  pending_tasks: number
  in_progress_tasks: number
  completed_tasks: number
}

export interface DashboardData {
  projects: ProjectSummary[]
  active_sprints: SprintSummary[]
  summary: DashboardSummary
  recent_activity: Activity[]
}
