import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Priority } from '@/features/projects/types'
import { useSprints } from '@/features/sprints/hooks'
import { useTags } from '@/features/tags/hooks/useTags'
import type { TaskStatus, TaskType } from '@/features/tasks/types'

interface TaskFiltersProps {
  projectId: number
  search: string
  status?: TaskStatus
  priority?: Priority
  type?: TaskType
  sprintId?: number
  tagId?: number
  onChange: (key: 'search' | 'status' | 'priority' | 'type' | 'sprint' | 'tag', value?: string) => void
  onClear: () => void
}

const selectClass = 'h-10 min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100'

export function TaskFilters({ projectId, search, status, priority, type, sprintId, tagId, onChange, onClear }: TaskFiltersProps) {
  const [searchValue, setSearchValue] = useState(search)
  const sprintsQuery = useSprints(projectId)
  const tagsQuery = useTags()
  const hasFilters = Boolean(search || status || priority || type || sprintId || tagId)

  useEffect(() => {
    if (searchValue === search) return
    const timeoutId = window.setTimeout(() => onChange('search', searchValue), 350)
    return () => window.clearTimeout(timeoutId)
  }, [onChange, search, searchValue])

  return (
    <div className="mt-5 grid gap-3 border-y border-zinc-200 bg-white px-4 py-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-[minmax(13rem,1fr)_repeat(5,minmax(8rem,auto))_auto]">
      <div className="relative min-w-0">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input aria-label="Buscar tareas" className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" maxLength={255} onChange={(event) => setSearchValue(event.target.value)} placeholder="Buscar por título" type="search" value={searchValue} />
      </div>
      <select aria-label="Filtrar por estado" className={selectClass} onChange={(event) => onChange('status', event.target.value || undefined)} value={status ?? ''}>
        <option value="">Todos los estados</option><option value="backlog">Backlog</option><option value="todo">Por hacer</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueada</option><option value="done">Terminada</option>
      </select>
      <select aria-label="Filtrar por prioridad" className={selectClass} onChange={(event) => onChange('priority', event.target.value || undefined)} value={priority ?? ''}>
        <option value="">Todas las prioridades</option><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
      </select>
      <select aria-label="Filtrar por tipo" className={selectClass} onChange={(event) => onChange('type', event.target.value || undefined)} value={type ?? ''}>
        <option value="">Todos los tipos</option><option value="story">Historia</option><option value="task">Tarea</option><option value="bug">Bug</option><option value="improvement">Mejora</option>
      </select>
      <select aria-label="Filtrar por Sprint" className={selectClass} disabled={sprintsQuery.isPending || sprintsQuery.isError} onChange={(event) => onChange('sprint', event.target.value || undefined)} value={sprintId ?? ''}>
        <option value="">Todos los Sprints</option>{(sprintsQuery.data?.data ?? []).map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}</option>)}
      </select>
      <select aria-label="Filtrar por etiqueta" className={selectClass} disabled={tagsQuery.isPending || tagsQuery.isError} onChange={(event) => onChange('tag', event.target.value || undefined)} value={tagId ?? ''}>
        <option value="">Todas las etiquetas</option>{(tagsQuery.data ?? []).map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
      </select>
      {hasFilters && <button className="flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" onClick={() => { setSearchValue(''); onClear() }} type="button"><X aria-hidden="true" size={17} />Limpiar</button>}
    </div>
  )
}
