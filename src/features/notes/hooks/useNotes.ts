import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { noteKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from '@/features/notes/api/notesApi'
import type {
  CreateNotePayload,
  ProjectNote,
  ProjectNoteSummary,
  UpdateNotePayload,
} from '@/features/notes/types'

export function useNotes(projectId: number, page = 1) {
  return useQuery<PaginatedResponse<ProjectNoteSummary>, ApiError>({
    queryKey: noteKeys.list(projectId, page),
    queryFn: ({ signal }) => getNotes(projectId, page, { signal }),
    enabled: projectId > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

export function useNote(projectId: number, noteId?: number) {
  return useQuery<ProjectNote, ApiError>({
    queryKey: noteKeys.detail(projectId, noteId ?? 0),
    queryFn: ({ signal }) => getNote(projectId, noteId!, { signal }),
    enabled: projectId > 0 && Boolean(noteId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation<ProjectNote, ApiError, { projectId: number; payload: CreateNotePayload }>({
    mutationFn: ({ projectId, payload }) => createNote(projectId, payload),
    onSuccess: (note, { projectId }) => {
      queryClient.setQueryData(noteKeys.detail(projectId, note.id), note)
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists(projectId) })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation<ProjectNote, ApiError, { projectId: number; noteId: number; payload: UpdateNotePayload }>({
    mutationFn: ({ projectId, noteId, payload }) => updateNote(projectId, noteId, payload),
    onSuccess: (note, { projectId }) => {
      queryClient.setQueryData(noteKeys.detail(projectId, note.id), note)
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists(projectId) })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, { projectId: number; noteId: number }>({
    mutationFn: ({ projectId, noteId }) => deleteNote(projectId, noteId),
    onSuccess: (_, { projectId, noteId }) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(projectId, noteId) })
      void queryClient.invalidateQueries({ queryKey: noteKeys.lists(projectId) })
    },
  })
}
