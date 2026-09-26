import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { PaginatedResponse } from '@/api/types'
import type { Activity, ActivityType } from '@/features/activity/types'

export interface ActivityFilters {
  page?: number
  type?: ActivityType
  date_from?: string
  date_to?: string
}

export async function getActivities(
  projectId: number,
  filters: ActivityFilters = {},
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<Activity>> {
  const { data } = await api.get<PaginatedResponse<Activity>>(
    `/projects/${projectId}/activities`,
    { ...options, params: filters },
  )

  return data
}
