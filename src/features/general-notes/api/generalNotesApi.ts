import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { ApiResourceResponse, PaginatedResponse } from '@/api/types'
import type {
  GeneralNote,
  GeneralNotePayload,
  GeneralNoteSummary,
  UpdateGeneralNotePayload,
} from '@/features/general-notes/types'

export interface GeneralNoteFilters {
  page?: number
  search?: string
}

export const generalNoteEndpoints = {
  index: '/notes',
  create: '/notes',
  show: (noteId: number) => `/notes/${noteId}`,
  update: (noteId: number) => `/notes/${noteId}`,
  destroy: (noteId: number) => `/notes/${noteId}`,
} as const

export async function getGeneralNotes(
  filters: GeneralNoteFilters = {},
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<GeneralNoteSummary>> {
  const { data } = await api.get<PaginatedResponse<GeneralNoteSummary>>(
    generalNoteEndpoints.index,
    {
      ...options,
      params: { page: filters.page, search: filters.search?.trim() || undefined },
    },
  )
  return data
}

export async function getGeneralNote(
  noteId: number,
  options?: ApiRequestOptions,
): Promise<GeneralNote> {
  const { data } = await api.get<ApiResourceResponse<GeneralNote>>(
    generalNoteEndpoints.show(noteId),
    options,
  )
  return data.data
}

export async function createGeneralNote(payload: GeneralNotePayload): Promise<GeneralNote> {
  const { data } = await api.post<ApiResourceResponse<GeneralNote>>(
    generalNoteEndpoints.create,
    payload,
  )
  return data.data
}

export async function updateGeneralNote(
  noteId: number,
  payload: UpdateGeneralNotePayload,
): Promise<GeneralNote> {
  const { data } = await api.patch<ApiResourceResponse<GeneralNote>>(
    generalNoteEndpoints.update(noteId),
    payload,
  )
  return data.data
}

export async function deleteGeneralNote(noteId: number): Promise<void> {
  await api.delete(generalNoteEndpoints.destroy(noteId))
}
