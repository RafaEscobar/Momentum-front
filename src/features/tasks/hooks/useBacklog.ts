import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { backlogKeys } from '@/api/queryKeys'
import { getBacklog } from '@/features/tasks/api/backlogApi'
import type { BacklogFilters, BacklogResponse } from '@/features/tasks/api/backlogApi'

export function useBacklog(projectId: number, filters: BacklogFilters = {}) {
  return useQuery<BacklogResponse, ApiError>({
    queryKey: backlogKeys.list(projectId, filters),
    queryFn: ({ signal }) => getBacklog(projectId, filters, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  })
}
