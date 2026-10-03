import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, FilePenLine, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { generalNoteKeys } from '@/api/queryKeys'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Skeleton } from '@/components/common/Skeleton'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import {
  useCreateGeneralNote,
  useGeneralNote,
  useUpdateGeneralNote,
} from '@/features/general-notes/hooks/useGeneralNotes'
import type { GeneralNote, GeneralNoteSummary } from '@/features/general-notes/types'
import { MarkdownPreview } from '@/features/notes/components/MarkdownPreview'
import { noteSchema } from '@/features/notes/schemas/noteSchema'
import type { NoteFormValues } from '@/features/notes/schemas/noteSchema'
import { useQueryClient } from '@tanstack/react-query'

interface GeneralNoteEditorModalProps {
  note?: GeneralNoteSummary
  onClose: () => void
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700">{message}</p> : null
}

function GeneralNoteForm({ note, onClose }: { note?: GeneralNote; onClose: () => void }) {
  const [mode, setMode] = useState<'editor' | 'preview'>('editor')
  const createMutation = useCreateGeneralNote()
  const updateMutation = useUpdateGeneralNote()
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: note?.title ?? '', content: note?.content ?? '' },
  })
  const content = useWatch({ control, name: 'content' })

  const onSubmit = handleSubmit(async (values) => {
    clearErrors('root')
    const payload = { title: values.title.trim(), content: values.content }

    try {
      if (note) {
        await updateMutation.mutateAsync({ noteId: note.id, payload })
        toast.success('Nota general actualizada')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Nota general creada')
      }
      onClose()
    } catch (error: unknown) {
      if (!isApiError(error)) {
        setError('root.server', { message: 'No fue posible guardar la nota.' })
        return
      }
      const titleError = error.validationErrors?.title?.[0]
      const contentError = error.validationErrors?.content?.[0]
      if (titleError) setError('title', { message: titleError })
      if (contentError) setError('content', { message: contentError })
      if (!titleError && !contentError) setError('root.server', { message: error.message })
    }
  })

  return (
    <form noValidate onSubmit={(event) => void onSubmit(event)}>
      <div className="px-5 py-5 sm:px-6">
        {errors.root?.server?.message && (
          <div className="mb-4 flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            <AlertTriangle aria-hidden="true" className="shrink-0" size={18} />
            {errors.root.server.message}
          </div>
        )}
        <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="general-note-title">Título</label>
        <Input {...register('title')} aria-invalid={Boolean(errors.title)} autoFocus id="general-note-title" maxLength={255} />
        <FieldError message={errors.title?.message} />

        <div className="mt-5 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-zinc-800" htmlFor="general-note-content">Contenido</label>
          <div aria-label="Modo del contenido" className="inline-flex rounded-md border border-zinc-300 bg-zinc-50 p-0.5" role="group">
            <button aria-pressed={mode === 'editor'} className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${mode === 'editor' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`} onClick={() => setMode('editor')} type="button"><FilePenLine aria-hidden="true" size={14} />Editor</button>
            <button aria-pressed={mode === 'preview'} className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${mode === 'preview' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`} onClick={() => setMode('preview')} type="button"><Eye aria-hidden="true" size={14} />Preview</button>
          </div>
        </div>
        {mode === 'editor' ? (
          <Textarea {...register('content')} aria-invalid={Boolean(errors.content)} className="mt-2 min-h-72 font-mono" id="general-note-content" maxLength={50_000} />
        ) : (
          <div aria-label="Vista previa Markdown" className="mt-2 min-h-72 rounded-md border border-zinc-200 bg-white p-4"><MarkdownPreview content={content} /></div>
        )}
        <FieldError message={errors.content?.message} />
      </div>
      <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <Button disabled={isSubmitting} onClick={onClose} variant="ghost">Cancelar</Button>
        <Button disabled={isSubmitting} type="submit">{isSubmitting ? <Spinner size={17} /> : <Save aria-hidden="true" size={17} />}Guardar</Button>
      </footer>
    </form>
  )
}

export function GeneralNoteEditorModal({ note, onClose }: GeneralNoteEditorModalProps) {
  const noteQuery = useGeneralNote(note?.id)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (note && noteQuery.error?.status === 404) {
      void queryClient.invalidateQueries({ queryKey: generalNoteKeys.lists() })
    }
  }, [note, noteQuery.error, queryClient])

  return (
    <Modal onClose={onClose} title={note ? 'Editar nota general' : 'Nueva nota general'}>
      {note && noteQuery.isPending ? (
        <div aria-label="Cargando nota general" className="space-y-4 p-6" role="status"><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" /></div>
      ) : note && noteQuery.isError ? (
        <div className="p-8 text-center">
          <AlertTriangle aria-hidden="true" className="mx-auto text-red-600" size={28} />
          <h3 className="mt-3 text-sm font-semibold text-zinc-950">{noteQuery.error.status === 404 ? 'Nota no encontrada' : 'No pudimos cargar la nota'}</h3>
          <p className="mt-1 text-sm text-zinc-600">{noteQuery.error.status === 404 ? 'La nota no existe o ya no está disponible.' : noteQuery.error.message}</p>
          <Button className="mt-4" onClick={noteQuery.error.status === 404 ? onClose : () => void noteQuery.refetch()} size="sm" variant="secondary">{noteQuery.error.status === 404 ? 'Cerrar' : 'Reintentar'}</Button>
        </div>
      ) : (
        <GeneralNoteForm key={noteQuery.data?.id ?? 'create'} note={noteQuery.data} onClose={onClose} />
      )}
    </Modal>
  )
}
