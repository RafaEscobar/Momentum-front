import { QueryClient } from '@tanstack/react-query'

import { isApiError } from '@/api/errors'

function shouldRetry(failureCount: number, error: Error) {
  if (isApiError(error) && error.status && error.status >= 400 && error.status < 500) {
    return false
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
