import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { GlobalSearchParams, GlobalSearchResponse } from '@/features/search/types'

export async function globalSearch(
  params: GlobalSearchParams,
  options?: ApiRequestOptions,
): Promise<GlobalSearchResponse> {
  const { data } = await api.get<GlobalSearchResponse>('/search', {
    ...options,
    params: { ...params, q: params.q.trim() },
  })
  return data
}
