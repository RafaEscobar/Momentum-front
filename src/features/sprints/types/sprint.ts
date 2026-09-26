export type SprintStatus = 'planned' | 'active' | 'completed'

export interface SprintSummary {
  id: number
  project_id: number
  name: string
  start_date: string | null
  end_date: string | null
  status: SprintStatus
  planned_points: number
  completed_points: number
  progress_percentage: number
  completed_at: string | null
}

export interface Sprint extends SprintSummary {
  goal: string | null
  created_at: string
  updated_at: string
}

export interface CreateSprintPayload {
  name: string
  goal?: string | null
  start_date?: string | null
  end_date?: string | null
  status?: SprintStatus
}

export type UpdateSprintPayload = Partial<CreateSprintPayload>
