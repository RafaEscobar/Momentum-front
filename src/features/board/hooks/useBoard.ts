import { useQuery } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { boardKeys } from '@/api/queryKeys'
import { getBoard } from '@/features/board/api/boardApi'
import type { BoardResponse } from '@/features/board/api/boardApi'

export function useBoard(projectId: number, sprintId?: number) {
  return useQuery<BoardResponse, ApiError>({
    queryKey: boardKeys.detail(projectId, sprintId),
    queryFn: ({ signal }) => getBoard(projectId, sprintId, { signal }),
    enabled: Number.isInteger(projectId) && projectId > 0,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  })
}
