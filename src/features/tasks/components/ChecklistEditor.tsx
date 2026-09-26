import { Check, Circle, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Input } from '@/components/common/Input'
import { ProgressBar } from '@/components/common/ProgressBar'
import { useCreateChecklistItem, useDeleteChecklistItem, useUpdateChecklistItem } from '@/features/tasks/hooks/useChecklist'
import type { ChecklistItem } from '@/features/tasks/types'

interface ChecklistEditorProps { projectId: number; taskId: number; items: ChecklistItem[] }

export function ChecklistEditor({ projectId, taskId, items }: ChecklistEditorProps) {
  const createMutation = useCreateChecklistItem()
  const updateMutation = useUpdateChecklistItem()
  const deleteMutation = useDeleteChecklistItem()
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<ChecklistItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ChecklistItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const completed = items.filter((item) => item.is_completed).length
  const progress = items.length ? Math.round((completed / items.length) * 100) : 0

  const message = (caught: unknown) => isApiError(caught) ? caught.message : 'No fue posible actualizar el checklist.'
  const add = async () => {
    const value = title.trim()
    if (!value || value.length > 255) { setError('El título debe tener entre 1 y 255 caracteres.'); return }
    try { await createMutation.mutateAsync({ projectId, taskId, title: value, position: items.length }); setTitle(''); setError(null) } catch (caught) { setError(message(caught)) }
  }
  const toggle = async (item: ChecklistItem) => {
    try { await updateMutation.mutateAsync({ projectId, taskId, itemId: item.id, payload: { is_completed: !item.is_completed } }) } catch (caught) { setError(message(caught)) }
  }
  const save = async () => {
    const value = editTitle.trim()
    if (!editing || !value || value.length > 255) { setError('El título debe tener entre 1 y 255 caracteres.'); return }
    try { await updateMutation.mutateAsync({ projectId, taskId, itemId: editing.id, payload: { title: value } }); setEditing(null); setError(null) } catch (caught) { setError(message(caught)) }
  }
  const remove = async () => {
    if (!deleteTarget) return
    try { await deleteMutation.mutateAsync({ projectId, taskId, itemId: deleteTarget.id }); setDeleteTarget(null); toast.success('Elemento eliminado') } catch (caught) { setError(message(caught)); setDeleteTarget(null) }
  }

  return <section className="border-t border-zinc-200 px-5 py-5 sm:px-6">
    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-zinc-950">Checklist</h3><span className="text-xs font-medium text-zinc-500">{completed}/{items.length}</span></div>
    <div className="mt-2"><ProgressBar label="Progreso del checklist" value={progress} /></div>
    <div className="mt-4 flex gap-2"><Input aria-label="Nuevo elemento de checklist" maxLength={255} onChange={(event) => setTitle(event.target.value)} placeholder="Añadir elemento" value={title} /><Button aria-label="Añadir al checklist" disabled={createMutation.isPending} onClick={() => void add()} size="icon">{createMutation.isPending ? <LoaderCircle className="animate-spin" size={17} /> : <Plus size={17} />}</Button></div>
    {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    {items.length === 0 ? <p className="mt-4 text-sm text-zinc-500">Esta tarea todavía no tiene elementos.</p> : <ul className="mt-3 divide-y divide-zinc-100">{items.map((item) => <li className="flex min-h-11 items-center gap-2 py-2" key={item.id}>
      {editing?.id === item.id ? <><Input aria-label={`Editar ${item.title}`} className="h-9 flex-1" maxLength={255} onChange={(event) => setEditTitle(event.target.value)} value={editTitle} /><Button aria-label="Guardar elemento" onClick={() => void save()} size="icon" variant="ghost"><Check size={16} /></Button><Button aria-label="Cancelar edición" onClick={() => setEditing(null)} size="icon" variant="ghost"><X size={16} /></Button></> : <><button aria-label={`${item.is_completed ? 'Desmarcar' : 'Marcar'} ${item.title}`} className="text-zinc-400 hover:text-emerald-700" disabled={updateMutation.isPending} onClick={() => void toggle(item)} type="button">{item.is_completed ? <Check className="text-emerald-700" size={19} /> : <Circle size={19} />}</button><span className={`min-w-0 flex-1 text-sm ${item.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-700'}`}>{item.title}</span><Button aria-label={`Editar ${item.title}`} onClick={() => { setEditing(item); setEditTitle(item.title) }} size="icon" variant="ghost"><Pencil size={15} /></Button><Button aria-label={`Eliminar ${item.title}`} onClick={() => setDeleteTarget(item)} size="icon" variant="ghost"><Trash2 size={15} /></Button></>}
    </li>)}</ul>}
    {deleteTarget && <ConfirmDialog confirmLabel="Eliminar" description={`Se eliminará “${deleteTarget.title}” del checklist.`} isPending={deleteMutation.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} title="Eliminar elemento" />}
  </section>
}
