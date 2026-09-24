import { AlertTriangle, ChevronLeft, ChevronRight, FolderOpen, LoaderCircle, Plus, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { ProjectFiltersBar } from '@/features/projects/components/ProjectFiltersBar'
import { ProjectFormModal } from '@/features/projects/components/ProjectFormModal'
import { ProjectsSkeleton } from '@/features/projects/components/ProjectsSkeleton'
import { useProjects } from '@/features/projects/hooks'
import type { Priority, ProjectStatus, ProjectSummary } from '@/features/projects/types'

const projectStatuses = ['active', 'paused', 'completed', 'archived'] as const
const priorities = ['low', 'medium', 'high', 'critical'] as const

function parsePage(value: string | null) {
  const page = Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function parseStatus(value: string | null): ProjectStatus | undefined {
  return projectStatuses.find((status) => status === value)
}

function parsePriority(value: string | null): Priority | undefined {
  return priorities.find((priority) => priority === value)
}

export function Component() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [editorProject, setEditorProject] = useState<ProjectSummary | 'create' | null>(null)
  const search = searchParams.get('search')?.trim() ?? ''
  const status = parseStatus(searchParams.get('status'))
  const priority = parsePriority(searchParams.get('priority'))
  const page = parsePage(searchParams.get('page'))
  const projectsQuery = useProjects({
    page,
    search: search || undefined,
    status,
    priority,
  })

  const updateFilter = useCallback(
    (key: 'search' | 'status' | 'priority', value?: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          if (value) {
            next.set(key, value)
          } else {
            next.delete(key)
          }

          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      const normalizedSearch = value.trim()

      if (normalizedSearch !== search) {
        updateFilter('search', normalizedSearch || undefined)
      }
    },
    [search, updateFilter],
  )

  const changePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)

      if (nextPage > 1) {
        next.set('page', String(nextPage))
      } else {
        next.delete('page')
      }

      return next
    })
  }

  const clearFilters = () => setSearchParams({}, { replace: true })
  const projects = projectsQuery.data?.data ?? []
  const meta = projectsQuery.data?.meta

  return (
    <section>
      <div className="mb-6 flex min-h-14 items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Proyectos</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {meta ? `${meta.total} ${meta.total === 1 ? 'proyecto' : 'proyectos'}` : 'Tu espacio de trabajo'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {projectsQuery.isFetching && !projectsQuery.isPending && (
            <div className="hidden items-center gap-2 text-xs font-medium text-zinc-500 sm:flex" role="status">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
              Actualizando
            </div>
          )}
          <button
            className="flex h-10 items-center gap-2 rounded-md bg-emerald-800 px-3 text-sm font-semibold text-white hover:bg-emerald-900"
            onClick={() => setEditorProject('create')}
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            <span className="hidden sm:inline">Nuevo proyecto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <ProjectFiltersBar
          key={`project-filters-${search}`}
          onClear={clearFilters}
          onPriorityChange={(value) => updateFilter('priority', value)}
          onSearchChange={handleSearchChange}
          onStatusChange={(value) => updateFilter('status', value)}
          priority={priority}
          search={search}
          status={status}
        />
      </div>

      <div className="mt-5">
        {projectsQuery.isPending ? (
          <ProjectsSkeleton />
        ) : projectsQuery.isError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-red-200 bg-white px-6 text-center">
            <AlertTriangle aria-hidden="true" className="text-red-600" size={28} />
            <h2 className="mt-3 text-base font-semibold text-zinc-950">No pudimos cargar los proyectos</h2>
            <p className="mt-1 max-w-md text-sm text-zinc-600">{projectsQuery.error.message}</p>
            <button
              className="mt-5 flex h-9 items-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700"
              onClick={() => void projectsQuery.refetch()}
              type="button"
            >
              <RefreshCw aria-hidden="true" size={16} />
              Reintentar
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-zinc-200 bg-white px-6 text-center">
            <FolderOpen aria-hidden="true" className="text-zinc-400" size={30} />
            <h2 className="mt-3 text-base font-semibold text-zinc-950">No hay proyectos para mostrar</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {search || status || priority
                ? 'Prueba con otros filtros.'
                : 'Los proyectos que crees aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} onEdit={setEditorProject} project={project} />
            ))}
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <nav aria-label="Paginación de proyectos" className="mt-6 flex items-center justify-center gap-3">
          <button
            aria-label="Página anterior"
            className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={meta.current_page <= 1}
            onClick={() => changePage(meta.current_page - 1)}
            type="button"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <span className="min-w-28 text-center text-sm text-zinc-600">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            aria-label="Página siguiente"
            className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => changePage(meta.current_page + 1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </nav>
      )}

      {editorProject && (
        <ProjectFormModal
          key={editorProject === 'create' ? 'create-project' : `edit-project-${editorProject.id}`}
          onClose={() => setEditorProject(null)}
          project={editorProject === 'create' ? undefined : editorProject}
        />
      )}
    </section>
  )
}
