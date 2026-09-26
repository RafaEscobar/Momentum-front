import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { NoteEditorModal } from '@/features/notes/components/NoteEditorModal'
import { useDeleteNote, useNotes } from '@/features/notes/hooks/useNotes'
import type { ProjectNoteSummary } from '@/features/notes/types'
import { useProject } from '@/features/projects/hooks'

function parsePage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function NotesSkeleton() {
  return (
    <div aria-label="Cargando notas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status">
      {[0, 1, 2].map((item) => (
        <div className="h-36 rounded-md border border-zinc-200 bg-white p-5" key={item}>
          <Skeleton className="h-5 w-3/4" /><Skeleton className="mt-4 h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const noteParam = Number(searchParams.get('note'))
  const linkedNoteId = Number.isInteger(noteParam) && noteParam > 0 ? noteParam : undefined
  const [editorNote, setEditorNote] = useState<ProjectNoteSummary | 'create' | null>(null)
  const [deletingNote, setDeletingNote] = useState<ProjectNoteSummary | null>(null)
  const projectQuery = useProject(projectId)
  const notesQuery = useNotes(projectId, page)
  const deleteMutation = useDeleteNote()
  const notes = notesQuery.data?.data ?? []
  const meta = notesQuery.data?.meta
  const activeEditor = editorNote ?? (linkedNoteId
    ? { id: linkedNoteId, project_id: projectId, title: 'Nota' }
    : null)

  const closeEditor = () => {
    setEditorNote(null)
    if (linkedNoteId) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        next.delete('note')
        return next
      }, { replace: true })
    }
  }

  const changePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextPage > 1) next.set('page', String(nextPage))
      else next.delete('page')
      return next
    })
  }

  const confirmDelete = async () => {
    if (!deletingNote) return
    try {
      await deleteMutation.mutateAsync({ projectId, noteId: deletingNote.id })
      toast.success('Nota eliminada')
      setDeletingNote(null)
    } catch {
      toast.error('No fue posible eliminar la nota')
    }
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return <EmptyState description="El identificador del proyecto no es válido." icon={<AlertTriangle size={30} />} title="Notas no disponibles" />
  }

  return (
    <section>
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}`}>
        <ArrowLeft aria-hidden="true" size={17} />
        {projectQuery.data?.name ?? 'Proyecto'}
      </Link>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Notas</h1>
          <p className="mt-1 text-sm text-zinc-600">Documentación y decisiones del proyecto.</p>
        </div>
        <Button onClick={() => setEditorNote('create')}>
          <Plus aria-hidden="true" size={18} />Nueva nota
        </Button>
      </div>

      <div className="mt-6">
        {notesQuery.isPending ? (
          <NotesSkeleton />
        ) : notesQuery.isError ? (
          <div className="rounded-md border border-red-200 bg-white py-8">
            <EmptyState
              action={<Button onClick={() => void notesQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>}
              description={notesQuery.error.message}
              icon={<AlertTriangle className="text-red-600" size={30} />}
              title="No pudimos cargar las notas"
            />
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white py-8">
            <EmptyState
              action={<Button onClick={() => setEditorNote('create')} size="sm"><Plus size={16} />Crear nota</Button>}
              description="Crea una nota para registrar contexto, acuerdos o documentación."
              icon={<FileText size={30} />}
              title="Todavía no hay notas"
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <article className="flex min-h-36 flex-col rounded-md border border-zinc-200 bg-white p-5 shadow-sm" key={note.id}>
                <div className="flex items-start gap-3">
                  <FileText aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={19} />
                  <h2 className="line-clamp-2 text-sm font-semibold text-zinc-950">{note.title}</h2>
                </div>
                <div className="mt-auto flex justify-end gap-2 pt-5">
                  <button
                    aria-label={`Editar nota ${note.title}`}
                    className="grid size-9 place-items-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    onClick={() => setEditorNote(note)}
                    title="Editar nota"
                    type="button"
                  ><Pencil aria-hidden="true" size={16} /></button>
                  <button
                    aria-label={`Eliminar nota ${note.title}`}
                    className="grid size-9 place-items-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeletingNote(note)}
                    title="Eliminar nota"
                    type="button"
                  ><Trash2 aria-hidden="true" size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <nav aria-label="Paginación de notas" className="mt-6 flex items-center justify-center gap-3">
          <button aria-label="Página anterior" className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} type="button"><ChevronLeft size={18} /></button>
          <span className="min-w-28 text-center text-sm text-zinc-600">Página {meta.current_page} de {meta.last_page}</span>
          <button aria-label="Página siguiente" className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} type="button"><ChevronRight size={18} /></button>
        </nav>
      )}

      {activeEditor && (
        <NoteEditorModal
          key={activeEditor === 'create' ? 'create-note' : `edit-note-${activeEditor.id}`}
          note={activeEditor === 'create' ? undefined : activeEditor}
          onClose={closeEditor}
          projectId={projectId}
        />
      )}
      {deletingNote && (
        <ConfirmDialog
          confirmLabel="Eliminar"
          description={`La nota “${deletingNote.title}” se eliminará permanentemente.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setDeletingNote(null)}
          onConfirm={() => void confirmDelete()}
          title="Eliminar nota"
        />
      )}
    </section>
  )
}
