import { AlertTriangle, ChevronLeft, ChevronRight, FileText, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { GeneralNoteEditorModal } from '@/features/general-notes/components/GeneralNoteEditorModal'
import { useDeleteGeneralNote, useGeneralNotes } from '@/features/general-notes/hooks/useGeneralNotes'
import type { GeneralNoteSummary } from '@/features/general-notes/types'

function positivePage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'Sin fecha'
}

function GeneralNotesSkeleton() {
  return <div aria-label="Cargando notas generales" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status">{[0, 1, 2].map((item) => <div className="h-40 rounded-md border border-zinc-200 bg-white p-5" key={item}><Skeleton className="h-5 w-3/4" /><Skeleton className="mt-4 h-4 w-28" /></div>)}</div>
}

function GeneralNotesSearch({
  initialValue,
  onSearch,
}: {
  initialValue: string
  onSearch: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = value.trim()
      if (normalized !== initialValue) onSearch(normalized)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [initialValue, onSearch, value])

  return <div className="relative mt-6 max-w-md"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} /><input aria-label="Buscar notas generales" className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-10 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" maxLength={255} onChange={(event) => setValue(event.target.value)} placeholder="Buscar por título" type="search" value={value} />{value && <button aria-label="Limpiar búsqueda" className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800" onClick={() => { setValue(''); onSearch('') }} type="button"><X aria-hidden="true" size={16} /></button>}</div>
}

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = positivePage(searchParams.get('page'))
  const search = searchParams.get('search')?.slice(0, 255) ?? ''
  const linkedNote = Number(searchParams.get('note'))
  const linkedNoteId = Number.isInteger(linkedNote) && linkedNote > 0 ? linkedNote : undefined
  const [editorNote, setEditorNote] = useState<GeneralNoteSummary | 'create' | null>(null)
  const [deletingNote, setDeletingNote] = useState<GeneralNoteSummary | null>(null)
  const notesQuery = useGeneralNotes({ page, search })
  const deleteMutation = useDeleteGeneralNote()
  const notes = notesQuery.data?.data ?? []
  const meta = notesQuery.data?.meta
  const activeEditor = editorNote ?? (linkedNoteId ? { id: linkedNoteId, title: 'Nota', created_at: null, updated_at: null } : null)

  const updateSearch = (value: string) => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    next.delete('page')
    if (value) next.set('search', value)
    else next.delete('search')
    return next
  }, { replace: true })

  const closeEditor = () => {
    setEditorNote(null)
    if (linkedNoteId) setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('note'); return next }, { replace: true })
  }

  const changePage = (nextPage: number) => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    if (nextPage > 1) next.set('page', String(nextPage))
    else next.delete('page')
    return next
  })

  const confirmDelete = async () => {
    if (!deletingNote) return
    try {
      await deleteMutation.mutateAsync(deletingNote.id)
      toast.success('Nota general eliminada')
      setDeletingNote(null)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'No fue posible eliminar la nota.')
    }
  }

  return <section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-semibold text-zinc-950">Notas generales</h1><p className="mt-1 text-sm text-zinc-600">Ideas, referencias y documentación fuera de tus proyectos.</p></div>
      <Button className="self-start" onClick={() => setEditorNote('create')}><Plus aria-hidden="true" size={18} />Nueva nota</Button>
    </div>

    <GeneralNotesSearch initialValue={search} key={search} onSearch={updateSearch} />

    <div className="mt-6">{notesQuery.isPending ? <GeneralNotesSkeleton /> : notesQuery.isError ? <div className="rounded-md border border-red-200 bg-white py-8"><EmptyState action={<Button onClick={() => void notesQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>} description={notesQuery.error.message} icon={<AlertTriangle className="text-red-600" size={30} />} title="No pudimos cargar las notas" /></div> : notes.length === 0 ? <div className="rounded-md border border-zinc-200 bg-white py-8"><EmptyState action={search ? <Button onClick={() => updateSearch('')} size="sm" variant="secondary">Limpiar búsqueda</Button> : <Button onClick={() => setEditorNote('create')} size="sm"><Plus size={16} />Crear nota</Button>} description={search ? 'Prueba con otro término de búsqueda.' : 'Guarda ideas y referencias que no pertenecen a un proyecto.'} icon={<FileText size={30} />} title={search ? 'Sin resultados' : 'Todavía no hay notas generales'} /></div> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{notes.map((note) => <article className="flex min-h-40 flex-col rounded-md border border-zinc-200 bg-white p-5 shadow-sm" key={note.id}><div className="flex items-start gap-3"><FileText aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-700" size={19} /><h2 className="line-clamp-2 text-sm font-semibold text-zinc-950">{note.title}</h2></div><p className="mt-3 text-xs text-zinc-500">Actualizada {formatDate(note.updated_at)}</p><div className="mt-auto flex justify-end gap-2 pt-5"><button aria-label={`Editar nota ${note.title}`} className="grid size-9 place-items-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" onClick={() => setEditorNote(note)} title="Editar nota" type="button"><Pencil aria-hidden="true" size={16} /></button><button aria-label={`Eliminar nota ${note.title}`} className="grid size-9 place-items-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeletingNote(note)} title="Eliminar nota" type="button"><Trash2 aria-hidden="true" size={16} /></button></div></article>)}</div>}</div>

    {meta && meta.last_page > 1 && <nav aria-label="Paginación de notas generales" className="mt-6 flex items-center justify-center gap-3"><button aria-label="Página anterior" className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} type="button"><ChevronLeft size={18} /></button><span className="min-w-28 text-center text-sm text-zinc-600">Página {meta.current_page} de {meta.last_page}</span><button aria-label="Página siguiente" className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 disabled:opacity-40" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} type="button"><ChevronRight size={18} /></button></nav>}

    {activeEditor && <GeneralNoteEditorModal key={activeEditor === 'create' ? 'create-general-note' : activeEditor.id} note={activeEditor === 'create' ? undefined : activeEditor} onClose={closeEditor} />}
    {deletingNote && <ConfirmDialog confirmLabel="Eliminar" description={`La nota “${deletingNote.title}” se eliminará permanentemente.`} isPending={deleteMutation.isPending} onCancel={() => setDeletingNote(null)} onConfirm={() => void confirmDelete()} title="Eliminar nota general" />}
  </section>
}
