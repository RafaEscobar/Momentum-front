import { FileText, FolderKanban, ListChecks, LoaderCircle, Search, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { useGlobalSearch } from '@/features/search/hooks/useGlobalSearch'

export function GlobalSearchBar() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')?.slice(0, 100) ?? ''
  const [value, setValue] = useState(query)
  const [debouncedValue, setDebouncedValue] = useState(query)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchQuery = useGlobalSearch({ q: debouncedValue })

  const updateQuery = useCallback((nextValue: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      const normalized = nextValue.trim()
      if (normalized) next.set('q', normalized)
      else next.delete('q')
      return next
    }, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalized = value.trim()
      setDebouncedValue(normalized)
      updateQuery(normalized)
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [updateQuery, value])

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const data = searchQuery.data
  const totalResults = data
    ? data.projects.length + data.tasks.length + data.notes.length
    : 0
  const showPanel = isOpen && value.trim().length >= 2
  const closeResults = () => setIsOpen(false)

  return (
    <div className="relative min-w-0 flex-1 sm:max-w-md" ref={containerRef}>
      <form onSubmit={(event) => { event.preventDefault(); setIsOpen(true); updateQuery(value) }} role="search">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-5 -translate-y-1/2 text-zinc-400" size={17} />
        <input
          aria-expanded={showPanel}
          aria-label="Búsqueda global"
          className="h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 pl-9 pr-9 text-sm outline-none focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          maxLength={100}
          minLength={2}
          onChange={(event) => { setValue(event.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(event) => { if (event.key === 'Escape') setIsOpen(false) }}
          placeholder="Buscar proyectos, tareas o notas"
          type="search"
          value={value}
        />
        {value && (
          <button
            aria-label="Limpiar búsqueda"
            className="absolute right-1 top-5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
            onClick={() => { setValue(''); setDebouncedValue(''); updateQuery(''); setIsOpen(false) }}
            type="button"
          ><X aria-hidden="true" size={16} /></button>
        )}
      </form>

      {showPanel && (
        <div className="fixed left-3 right-3 top-[4.5rem] z-40 max-h-[min(32rem,70vh)] overflow-y-auto rounded-md border border-zinc-200 bg-white shadow-xl sm:absolute sm:left-0 sm:right-auto sm:top-12 sm:w-full sm:min-w-72" role="dialog" aria-label="Resultados de búsqueda">
          {searchQuery.isPending || debouncedValue !== value.trim() ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-zinc-500" role="status"><LoaderCircle className="animate-spin" size={18} />Buscando</div>
          ) : searchQuery.isError ? (
            <div className="px-4 py-8 text-center text-sm text-red-700">{searchQuery.error.message}</div>
          ) : totalResults === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">No se encontraron resultados.</div>
          ) : (
            <div className="py-2">
              {data?.projects.length ? <SearchGroup icon={FolderKanban} label="Proyectos" items={data.projects.map((project) => ({ id: project.id, label: project.name, to: `/projects/${project.id}` }))} onNavigate={closeResults} /> : null}
              {data?.tasks.length ? <SearchGroup icon={ListChecks} label="Tareas" items={data.tasks.map((task) => ({ id: task.id, label: task.title, to: `/projects/${task.project_id}/board?task=${task.id}&action=edit` }))} onNavigate={closeResults} /> : null}
              {data?.notes.length ? <SearchGroup icon={FileText} label="Notas" items={data.notes.map((note) => ({ id: note.id, label: note.title, to: `/projects/${note.project_id}/notes?note=${note.id}` }))} onNavigate={closeResults} /> : null}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface SearchGroupProps {
  icon: typeof FolderKanban
  label: string
  items: Array<{ id: number; label: string; to: string }>
  onNavigate: () => void
}

function SearchGroup({ icon: Icon, items, label, onNavigate }: SearchGroupProps) {
  return <section aria-labelledby={`search-${label}`} className="border-b border-zinc-100 py-2 last:border-b-0">
    <h2 className="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase text-zinc-500" id={`search-${label}`}><Icon aria-hidden="true" size={14} />{label}</h2>
    {items.map((item) => <Link className="block truncate px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100" key={item.id} onClick={onNavigate} to={item.to}>{item.label}</Link>)}
  </section>
}
