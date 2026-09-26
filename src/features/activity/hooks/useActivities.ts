import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { activityKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import { getActivities } from '@/features/activity/api/activityApi'
import type { ActivityFilters } from '@/features/activity/api/activityApi'
import type { Activity } from '@/features/activity/types'

export function useActivities(projectId: number, filters: ActivityFilters = {}) {
  return useQuery<PaginatedResponse<Activity>, ApiError>({
    queryKey: activityKeys.list(projectId, filters),
    queryFn: ({ signal }) => getActivities(projectId, filters, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}
