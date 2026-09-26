import { Check, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { isApiError } from '@/api/errors'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Input } from '@/components/common/Input'
import { useCreateTag, useDeleteTag, useUpdateTag } from '@/features/tags/hooks/useTags'
import type { Tag } from '@/features/tasks/types'

interface TagManagerProps { tags: Tag[]; onDeleted: (tagId: number) => void }

const defaultColor = '#059669'

export function TagManager({ tags, onDeleted }: TagManagerProps) {
  const createMutation = useCreateTag()
  const updateMutation = useUpdateTag()
  const deleteMutation = useDeleteTag()
  const [name, setName] = useState('')
  const [color, setColor] = useState(defaultColor)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(defaultColor)
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validate = (value: string) => value.trim().length > 0 && value.trim().length <= 50

  const addTag = async () => {
    if (!validate(name)) { setError('El nombre debe tener entre 1 y 50 caracteres.'); return }
    setError(null)
    try {
      await createMutation.mutateAsync({ name: name.trim(), color })
      setName('')
      setColor(defaultColor)
      toast.success('Etiqueta creada')
    } catch (caught) { setError(isApiError(caught) ? caught.message : 'No fue posible crear la etiqueta.') }
  }

  const saveTag = async (tagId: number) => {
    if (!validate(editName)) { setError('El nombre debe tener entre 1 y 50 caracteres.'); return }
    setError(null)
    try {
      await updateMutation.mutateAsync({ tagId, payload: { name: editName.trim(), color: editColor } })
      setEditingId(null)
      toast.success('Etiqueta actualizada')
    } catch (caught) { setError(isApiError(caught) ? caught.message : 'No fue posible actualizar la etiqueta.') }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      onDeleted(deleteTarget.id)
      setDeleteTarget(null)
      toast.success('Etiqueta eliminada')
    } catch (caught) { setError(isApiError(caught) ? caught.message : 'No fue posible eliminar la etiqueta.'); setDeleteTarget(null) }
  }

  return <div className="mt-4 border-t border-zinc-200 pt-4">
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1"><label className="mb-1.5 block text-xs font-medium text-zinc-600" htmlFor="new-tag-name">Nueva etiqueta</label><Input id="new-tag-name" maxLength={50} onChange={(event) => setName(event.target.value)} placeholder="Nombre" value={name} /></div>
      <input aria-label="Color de nueva etiqueta" className="h-10 w-12 cursor-pointer rounded-md border border-zinc-300 bg-white p-1" onChange={(event) => setColor(event.target.value)} type="color" value={color} />
      <Button aria-label="Crear etiqueta" disabled={createMutation.isPending} onClick={() => void addTag()} size="icon"><Plus size={17} /></Button>
    </div>
    {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    {tags.length > 0 && <ul className="mt-3 divide-y divide-zinc-100">{tags.map((tag) => <li className="flex min-h-11 items-center gap-2 py-2" key={tag.id}>
      {editingId === tag.id ? <><Input aria-label={`Nombre de etiqueta ${tag.name}`} className="h-9 flex-1" maxLength={50} onChange={(event) => setEditName(event.target.value)} value={editName} /><input aria-label={`Color de etiqueta ${tag.name}`} className="h-9 w-11 cursor-pointer rounded-md border border-zinc-300 p-1" onChange={(event) => setEditColor(event.target.value)} type="color" value={editColor} /><Button aria-label={`Guardar etiqueta ${tag.name}`} disabled={updateMutation.isPending} onClick={() => void saveTag(tag.id)} size="icon" variant="ghost">{updateMutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}</Button><Button aria-label="Cancelar edición" onClick={() => setEditingId(null)} size="icon" variant="ghost"><X size={16} /></Button></> : <><span className="size-3 rounded-full" style={{ backgroundColor: tag.color }} /><span className="min-w-0 flex-1 truncate text-sm text-zinc-700">{tag.name}</span><Button aria-label={`Editar etiqueta ${tag.name}`} onClick={() => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color) }} size="icon" variant="ghost"><Pencil size={15} /></Button><Button aria-label={`Eliminar etiqueta ${tag.name}`} onClick={() => setDeleteTarget(tag)} size="icon" variant="ghost"><Trash2 size={15} /></Button></>}
    </li>)}</ul>}
    {deleteTarget && <ConfirmDialog confirmLabel="Eliminar" description={`La etiqueta “${deleteTarget.name}” se desasociará de todas las tareas.`} isPending={deleteMutation.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} title="Eliminar etiqueta" />}
  </div>
}
