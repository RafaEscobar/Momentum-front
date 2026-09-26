export const activityTypes = [
  'project_created',
  'project_updated',
  'task_created',
  'task_status_changed',
  'task_completed',
  'sprint_created',
  'sprint_started',
  'sprint_completed',
] as const

export type ActivityType = (typeof activityTypes)[number]

export interface ActivitySubject {
  id: number
  type: 'task' | 'sprint'
  label: string
}

export interface Activity {
  id: number
  project_id: number
  type: ActivityType
  description: string
  metadata: Record<string, unknown>
  subject: ActivitySubject | null
  created_at: string
}
