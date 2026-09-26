import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { searchKeys } from '@/api/queryKeys'
import { globalSearch } from '@/features/search/api/searchApi'
import type { GlobalSearchParams, GlobalSearchResponse } from '@/features/search/types'

export function useGlobalSearch(params: GlobalSearchParams) {
  const normalizedQuery = params.q.trim()
  return useQuery<GlobalSearchResponse, ApiError>({
    queryKey: searchKeys.results({ ...params, q: normalizedQuery }),
    queryFn: ({ signal }) => globalSearch({ ...params, q: normalizedQuery }, { signal }),
    enabled: normalizedQuery.length >= 2 && normalizedQuery.length <= 100,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}
