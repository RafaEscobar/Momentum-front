import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/api/errors'
import { generalNoteKeys } from '@/api/queryKeys'
import type { PaginatedResponse } from '@/api/types'
import {
  createGeneralNote,
  deleteGeneralNote,
  getGeneralNote,
  getGeneralNotes,
  updateGeneralNote,
} from '@/features/general-notes/api/generalNotesApi'
import type { GeneralNoteFilters } from '@/features/general-notes/api/generalNotesApi'
import type {
  GeneralNote,
  GeneralNotePayload,
  GeneralNoteSummary,
  UpdateGeneralNotePayload,
} from '@/features/general-notes/types'

export function useGeneralNotes(filters: GeneralNoteFilters = {}) {
  return useQuery<PaginatedResponse<GeneralNoteSummary>, ApiError>({
    queryKey: generalNoteKeys.list(filters),
    queryFn: ({ signal }) => getGeneralNotes(filters, { signal }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

export function useGeneralNote(noteId?: number) {
  return useQuery<GeneralNote, ApiError>({
    queryKey: generalNoteKeys.detail(noteId ?? 0),
    queryFn: ({ signal }) => getGeneralNote(noteId!, { signal }),
    enabled: Boolean(noteId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: (failureCount, error) => error.status !== 404 && failureCount < 2,
  })
}

export function useCreateGeneralNote() {
  const queryClient = useQueryClient()
  return useMutation<GeneralNote, ApiError, GeneralNotePayload>({
    mutationFn: createGeneralNote,
    onSuccess: (note) => {
      queryClient.setQueryData(generalNoteKeys.detail(note.id), note)
      void queryClient.invalidateQueries({ queryKey: generalNoteKeys.lists() })
    },
  })
}

export function useUpdateGeneralNote() {
  const queryClient = useQueryClient()
  return useMutation<
    GeneralNote,
    ApiError,
    { noteId: number; payload: UpdateGeneralNotePayload }
  >({
    mutationFn: ({ noteId, payload }) => updateGeneralNote(noteId, payload),
    onSuccess: (note) => {
      queryClient.setQueryData(generalNoteKeys.detail(note.id), note)
      void queryClient.invalidateQueries({ queryKey: generalNoteKeys.lists() })
    },
  })
}

export function useDeleteGeneralNote() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiError, number>({
    mutationFn: deleteGeneralNote,
    onSuccess: (_, noteId) => {
      queryClient.removeQueries({ queryKey: generalNoteKeys.detail(noteId) })
      void queryClient.invalidateQueries({ queryKey: generalNoteKeys.lists() })
    },
  })
}
