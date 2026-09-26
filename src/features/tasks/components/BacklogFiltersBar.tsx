import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Priority } from '@/features/projects/types'
import { useTags } from '@/features/tags/hooks/useTags'
import type { TaskType } from '@/features/tasks/types'

interface BacklogFiltersBarProps {
  search: string
  priority?: Priority
  type?: TaskType
  tagId?: number
  onSearchChange: (value: string) => void
  onPriorityChange: (value?: Priority) => void
  onTypeChange: (value?: TaskType) => void
  onTagChange: (value?: number) => void
  onClear: () => void
}

const selectClass = 'h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100'

export function BacklogFiltersBar({
  search,
  priority,
  type,
  tagId,
  onSearchChange,
  onPriorityChange,
  onTypeChange,
  onTagChange,
  onClear,
}: BacklogFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(search)
  const tagsQuery = useTags()
  const hasFilters = Boolean(search || priority || type || tagId)

  useEffect(() => {
    if (searchValue === search) return
    const timeoutId = window.setTimeout(() => onSearchChange(searchValue), 350)
    return () => window.clearTimeout(timeoutId)
  }, [onSearchChange, search, searchValue])

  return (
    <div className="mt-5 grid gap-3 border-y border-zinc-200 bg-white px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-[minmax(14rem,1fr)_auto_auto_auto_auto]">
      <div className="relative min-w-0">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input aria-label="Buscar en backlog" className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" maxLength={255} onChange={(event) => setSearchValue(event.target.value)} placeholder="Buscar por título" type="search" value={searchValue} />
      </div>
      <select aria-label="Filtrar por prioridad" className={selectClass} onChange={(event) => onPriorityChange((event.target.value || undefined) as Priority | undefined)} value={priority ?? ''}>
        <option value="">Todas las prioridades</option><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
      </select>
      <select aria-label="Filtrar por tipo" className={selectClass} onChange={(event) => onTypeChange((event.target.value || undefined) as TaskType | undefined)} value={type ?? ''}>
        <option value="">Todos los tipos</option><option value="story">Historia</option><option value="task">Tarea</option><option value="bug">Bug</option><option value="improvement">Mejora</option>
      </select>
      <select aria-label="Filtrar por etiqueta" className={selectClass} disabled={tagsQuery.isPending || tagsQuery.isError} onChange={(event) => onTagChange(event.target.value ? Number(event.target.value) : undefined)} value={tagId ?? ''}>
        <option value="">Todas las etiquetas</option>{(tagsQuery.data ?? []).map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
      </select>
      {hasFilters && <button className="flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" onClick={() => { setSearchValue(''); onClear() }} type="button"><X aria-hidden="true" size={17} />Limpiar</button>}
    </div>
  )
}
