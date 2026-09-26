import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { dashboardKeys } from '@/api/queryKeys'
import { getDashboard } from '@/features/dashboard/api/dashboardApi'
import type { DashboardData } from '@/features/dashboard/types'

export function useDashboard() {
  return useQuery<DashboardData, ApiError>({
    queryKey: dashboardKeys.all,
    queryFn: ({ signal }) => getDashboard({ signal }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}
