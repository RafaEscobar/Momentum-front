import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { ApiResourceResponse } from '@/api/types'
import type { Tag } from '@/features/tasks/types'

export async function getTags(options?: ApiRequestOptions): Promise<Tag[]> {
  const { data } = await api.get<ApiResourceResponse<Tag[]> | Tag[]>('/tags', options)

  return Array.isArray(data) ? data : data.data
}

export async function syncTaskTags(taskId: number, tagIds: number[]): Promise<void> {
  await api.put(`/tasks/${taskId}/tags`, { tag_ids: tagIds })
}

export interface TagPayload {
  name: string
  color: string
}

export async function createTag(payload: TagPayload): Promise<Tag> {
  const { data } = await api.post<ApiResourceResponse<Tag>>('/tags', payload)
  return data.data
}

export async function updateTag(tagId: number, payload: TagPayload): Promise<Tag> {
  const { data } = await api.patch<ApiResourceResponse<Tag>>(`/tags/${tagId}`, payload)
  return data.data
}

export async function deleteTag(tagId: number): Promise<void> {
  await api.delete(`/tags/${tagId}`)
}
