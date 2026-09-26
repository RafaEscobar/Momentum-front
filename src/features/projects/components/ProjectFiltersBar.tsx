import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { Priority, ProjectStatus } from '@/features/projects/types'

interface ProjectFiltersBarProps {
  search: string
  status?: ProjectStatus
  priority?: Priority
  onSearchChange: (value: string) => void
  onStatusChange: (value?: ProjectStatus) => void
  onPriorityChange: (value?: Priority) => void
  onClear: () => void
}

export function ProjectFiltersBar({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClear,
}: ProjectFiltersBarProps) {
  const [searchValue, setSearchValue] = useState(search)
  const hasFilters = Boolean(search || status || priority)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onSearchChange(searchValue), 350)

    return () => window.clearTimeout(timeoutId)
  }, [onSearchChange, searchValue])

  return (
    <div className="flex flex-col gap-3 border-y border-zinc-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          size={18}
        />
        <input
          aria-label="Buscar proyectos"
          className="h-10 w-full rounded-md border border-zinc-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Buscar por nombre"
          type="search"
          value={searchValue}
        />
      </div>

      <select
        aria-label="Filtrar por estado"
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        onChange={(event) => onStatusChange((event.target.value || undefined) as ProjectStatus | undefined)}
        value={status ?? ''}
      >
        <option value="">Todos los estados</option>
        <option value="active">Activos</option>
        <option value="paused">Pausados</option>
        <option value="completed">Completados</option>
        <option value="archived">Archivados</option>
      </select>

      <select
        aria-label="Filtrar por prioridad"
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        onChange={(event) => onPriorityChange((event.target.value || undefined) as Priority | undefined)}
        value={priority ?? ''}
      >
        <option value="">Todas las prioridades</option>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="critical">Crítica</option>
      </select>

      {hasFilters && (
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
          onClick={() => {
            setSearchValue('')
            onClear()
          }}
          type="button"
        >
          <X aria-hidden="true" size={17} />
          Limpiar
        </button>
      )}
    </div>
  )
}
