import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { backlogKeys, boardKeys, taskKeys } from '@/api/queryKeys'
import { createChecklistItem, deleteChecklistItem, updateChecklistItem } from '@/features/tasks/api/checklistApi'
import type { ChecklistItem, Task } from '@/features/tasks/types'

interface Context { projectId: number; taskId: number }

function updateChecklist(
  queryClient: ReturnType<typeof useQueryClient>,
  { projectId, taskId }: Context,
  updater: (items: ChecklistItem[]) => ChecklistItem[],
) {
  queryClient.setQueryData<Task>(taskKeys.detail(projectId, taskId), (task) =>
    task ? { ...task, checklist: updater(task.checklist ?? []) } : task,
  )
  void queryClient.invalidateQueries({ queryKey: taskKeys.lists(projectId) })
  void queryClient.invalidateQueries({ queryKey: backlogKeys.all(projectId) })
  void queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) })
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient()
  return useMutation<ChecklistItem, ApiError, Context & { title: string; position?: number }>({
    mutationFn: ({ taskId, title, position }) => createChecklistItem(taskId, { title, position }),
    onSuccess: (item, context) => updateChecklist(queryClient, context, (items) => [...items, item].sort((a, b) => a.position - b.position)),
  })
}

export function useUpdateChecklistItem() {
  const queryClient = useQueryClient()
  return useMutation<ChecklistItem, ApiError, Context & { itemId: number; payload: { title?: string; is_completed?: boolean } }>({
    mutationFn: ({ taskId, itemId, payload }) => updateChecklistItem(taskId, itemId, payload),
    onSuccess: (item, context) => updateChecklist(queryClient, context, (items) => items.map((current) => current.id === item.id ? item : current)),
  })
}

export function useDeleteChecklistItem() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, Context & { itemId: number }>({
    mutationFn: ({ taskId, itemId }) => deleteChecklistItem(taskId, itemId),
    onSuccess: (_, context) => updateChecklist(queryClient, context, (items) => items.filter((item) => item.id !== context.itemId)),
  })
}
