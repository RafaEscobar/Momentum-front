import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { backlogKeys, boardKeys, tagKeys, taskKeys } from '@/api/queryKeys'
import { createTag, deleteTag, getTags, syncTaskTags, updateTag } from '@/features/tags/api/tagsApi'
import type { TagPayload } from '@/features/tags/api/tagsApi'
import type { Tag } from '@/features/tasks/types'

interface SyncTaskTagsVariables {
  projectId: number
  taskId: number
  tagIds: number[]
}

export function useTags() {
  return useQuery<Tag[], ApiError>({
    queryKey: tagKeys.all,
    queryFn: ({ signal }) => getTags({ signal }),
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  })
}

export function useSyncTaskTags() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, SyncTaskTagsVariables>({
    mutationFn: ({ taskId, tagIds }) => syncTaskTags(taskId, tagIds),
    onSuccess: (_, { projectId, taskId }) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(projectId, taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) })
      void queryClient.invalidateQueries({ queryKey: backlogKeys.all(projectId) })
      void queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) })
    },
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation<Tag, ApiError, TagPayload>({
    mutationFn: createTag,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation<Tag, ApiError, { tagId: number; payload: TagPayload }>({
    mutationFn: ({ tagId, payload }) => updateTag(tagId, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: tagKeys.all }),
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: deleteTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
