import { api } from '@/api/client'
import type { ApiRequestOptions } from '@/api/client'
import type { ApiResourceResponse, PaginatedResponse } from '@/api/types'
import type {
  CreateNotePayload,
  ProjectNote,
  ProjectNoteSummary,
  UpdateNotePayload,
} from '@/features/notes/types'

function notesEndpoint(projectId: number) {
  return `/projects/${projectId}/notes`
}

function noteEndpoint(projectId: number, noteId: number) {
  return `${notesEndpoint(projectId)}/${noteId}`
}

export async function getNotes(
  projectId: number,
  page = 1,
  options?: ApiRequestOptions,
): Promise<PaginatedResponse<ProjectNoteSummary>> {
  const { data } = await api.get<PaginatedResponse<ProjectNoteSummary>>(notesEndpoint(projectId), {
    ...options,
    params: { page },
  })
  return data
}

export async function getNote(
  projectId: number,
  noteId: number,
  options?: ApiRequestOptions,
): Promise<ProjectNote> {
  const { data } = await api.get<ApiResourceResponse<ProjectNote>>(
    noteEndpoint(projectId, noteId),
    options,
  )
  return data.data
}

export async function createNote(projectId: number, payload: CreateNotePayload): Promise<ProjectNote> {
  const { data } = await api.post<ApiResourceResponse<ProjectNote>>(notesEndpoint(projectId), payload)
  return data.data
}

export async function updateNote(
  projectId: number,
  noteId: number,
  payload: UpdateNotePayload,
): Promise<ProjectNote> {
  const { data } = await api.patch<ApiResourceResponse<ProjectNote>>(
    noteEndpoint(projectId, noteId),
    payload,
  )
  return data.data
}

export async function deleteNote(projectId: number, noteId: number): Promise<void> {
  await api.delete(noteEndpoint(projectId, noteId))
}
