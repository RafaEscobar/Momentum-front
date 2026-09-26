import { api } from '@/api/client'
import type { ApiResourceResponse } from '@/api/types'
import type { ChecklistItem } from '@/features/tasks/types'

export async function createChecklistItem(
  taskId: number,
  payload: { title: string; position?: number },
): Promise<ChecklistItem> {
  const { data } = await api.post<ApiResourceResponse<ChecklistItem>>(
    `/tasks/${taskId}/checklist`,
    payload,
  )
  return data.data
}

export async function updateChecklistItem(
  taskId: number,
  itemId: number,
  payload: { title?: string; is_completed?: boolean },
): Promise<ChecklistItem> {
  const { data } = await api.patch<ApiResourceResponse<ChecklistItem>>(
    `/tasks/${taskId}/checklist/${itemId}`,
    payload,
  )
  return data.data
}

export async function deleteChecklistItem(taskId: number, itemId: number): Promise<void> {
  await api.delete(`/tasks/${taskId}/checklist/${itemId}`)
}
