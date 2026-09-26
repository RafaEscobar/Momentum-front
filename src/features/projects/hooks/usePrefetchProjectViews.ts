import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { backlogKeys, boardKeys, projectKeys, sprintKeys } from '@/api/queryKeys'
import { getBoard } from '@/features/board/api/boardApi'
import { getProjectStats } from '@/features/projects/api/projectsApi'
import { getSprints } from '@/features/sprints/api/sprintsApi'
import { getBacklog } from '@/features/tasks/api/backlogApi'

export function usePrefetchProjectViews(projectId: number) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      return
    }

    void queryClient.prefetchQuery({
      queryKey: backlogKeys.list(projectId, {}),
      queryFn: ({ signal }) => getBacklog(projectId, {}, { signal }),
    })
    void queryClient.prefetchQuery({
      queryKey: boardKeys.detail(projectId),
      queryFn: ({ signal }) => getBoard(projectId, undefined, { signal }),
    })
    void queryClient.prefetchQuery({
      queryKey: projectKeys.stats(projectId),
      queryFn: ({ signal }) => getProjectStats(projectId, { signal }),
    })

    void queryClient.prefetchQuery({
      queryKey: sprintKeys.list(projectId, {}),
      queryFn: ({ signal }) => getSprints(projectId, {}, { signal }),
    })
  }, [projectId, queryClient])
}
