import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, FilePenLine, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Skeleton } from '@/components/common/Skeleton'
import { Spinner } from '@/components/common/Spinner'
import { Textarea } from '@/components/common/Textarea'
import { MarkdownPreview } from '@/features/notes/components/MarkdownPreview'
import { useCreateNote, useNote, useUpdateNote } from '@/features/notes/hooks/useNotes'
import { noteSchema } from '@/features/notes/schemas/noteSchema'
import type { NoteFormValues } from '@/features/notes/schemas/noteSchema'
import type { ProjectNote, ProjectNoteSummary } from '@/features/notes/types'

interface NoteEditorModalProps {
  projectId: number
  note?: ProjectNoteSummary
  onClose: () => void
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs text-red-700">{message}</p> : null
}

function NoteForm({ projectId, note, onClose }: { projectId: number; note?: ProjectNote; onClose: () => void }) {
  const [mode, setMode] = useState<'editor' | 'preview'>('editor')
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()
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
    try {
      const payload = { title: values.title.trim(), content: values.content }
      if (note) {
        await updateMutation.mutateAsync({ projectId, noteId: note.id, payload })
        toast.success('Nota actualizada')
      } else {
        await createMutation.mutateAsync({ projectId, payload })
        toast.success('Nota creada')
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
        <label className="mb-2 block text-sm font-medium text-zinc-800" htmlFor="note-title">Título</label>
        <Input {...register('title')} aria-invalid={Boolean(errors.title)} autoFocus id="note-title" maxLength={255} />
        <FieldError message={errors.title?.message} />

        <div className="mt-5 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-zinc-800" htmlFor="note-content">Contenido</label>
          <div aria-label="Modo del contenido" className="inline-flex rounded-md border border-zinc-300 bg-zinc-50 p-0.5" role="group">
            <button
              aria-pressed={mode === 'editor'}
              className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${mode === 'editor' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`}
              onClick={() => setMode('editor')}
              type="button"
            ><FilePenLine aria-hidden="true" size={14} />Editor</button>
            <button
              aria-pressed={mode === 'preview'}
              className={`flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium ${mode === 'preview' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-950'}`}
              onClick={() => setMode('preview')}
              type="button"
            ><Eye aria-hidden="true" size={14} />Preview</button>
          </div>
        </div>
        {mode === 'editor' ? (
          <Textarea
            {...register('content')}
            aria-invalid={Boolean(errors.content)}
            className="mt-2 min-h-72 font-mono"
            id="note-content"
            maxLength={50_000}
          />
        ) : (
          <div aria-label="Vista previa Markdown" className="mt-2 min-h-72 rounded-md border border-zinc-200 bg-white p-4">
            <MarkdownPreview content={content} />
          </div>
        )}
        <FieldError message={errors.content?.message} />
      </div>
      <footer className="flex justify-end gap-3 border-t border-zinc-200 bg-zinc-50 px-5 py-4 sm:px-6">
        <Button disabled={isSubmitting} onClick={onClose} type="button" variant="ghost">Cancelar</Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Spinner size={17} /> : <Save aria-hidden="true" size={17} />}
          Guardar
        </Button>
      </footer>
    </form>
  )
}

export function NoteEditorModal({ projectId, note, onClose }: NoteEditorModalProps) {
  const noteQuery = useNote(projectId, note?.id)

  return (
    <Modal onClose={onClose} title={note ? 'Editar nota' : 'Nueva nota'}>
      {note && noteQuery.isPending ? (
        <div aria-label="Cargando nota" className="space-y-4 p-6" role="status">
          <Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" />
        </div>
      ) : note && noteQuery.isError ? (
        <div className="p-6 text-center">
          <AlertTriangle aria-hidden="true" className="mx-auto text-red-600" size={28} />
          <p className="mt-3 text-sm text-zinc-700">{noteQuery.error.message}</p>
          <Button className="mt-4" onClick={() => void noteQuery.refetch()} size="sm" variant="secondary">Reintentar</Button>
        </div>
      ) : (
        <NoteForm key={noteQuery.data?.id ?? 'create'} note={noteQuery.data} onClose={onClose} projectId={projectId} />
      )}
    </Modal>
  )
}
