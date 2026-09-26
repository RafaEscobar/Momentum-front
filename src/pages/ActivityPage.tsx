import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Skeleton } from '@/components/common/Skeleton'
import type { ActivityFilters } from '@/features/activity/api/activityApi'
import { ActivityTimeline } from '@/features/activity/components/ActivityTimeline'
import { useActivities } from '@/features/activity/hooks/useActivities'
import { activityTypes } from '@/features/activity/types'
import type { ActivityType } from '@/features/activity/types'
import { useProject } from '@/features/projects/hooks'

const activityTypeLabels: Record<ActivityType, string> = {
  project_created: 'Proyecto creado',
  project_updated: 'Proyecto actualizado',
  task_created: 'Tarea creada',
  task_status_changed: 'Estado de tarea actualizado',
  task_completed: 'Tarea completada',
  sprint_created: 'Sprint creado',
  sprint_started: 'Sprint iniciado',
  sprint_completed: 'Sprint completado',
}

function parsePage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function parseType(value: string | null) {
  return activityTypes.find((type) => type === value)
}

function parseDate(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined
}

function ActivitySkeleton() {
  return (
    <div aria-label="Cargando actividad" className="rounded-md border border-zinc-200 bg-white p-5" role="status">
      {[0, 1, 2, 3].map((item) => (
        <div className="flex gap-3 border-b border-zinc-100 py-4 last:border-b-0" key={item}>
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-7 rounded-full" />
          <div className="flex-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="mt-2 h-3 w-32" /></div>
        </div>
      ))}
    </div>
  )
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const filters: ActivityFilters = {
    page: parsePage(searchParams.get('page')),
    type: parseType(searchParams.get('type')),
    date_from: parseDate(searchParams.get('date_from')),
    date_to: parseDate(searchParams.get('date_to')),
  }
  const projectQuery = useProject(projectId)
  const activitiesQuery = useActivities(projectId, filters)
  const activities = activitiesQuery.data?.data ?? []
  const meta = activitiesQuery.data?.meta

  const updateFilter = (key: 'type' | 'date_from' | 'date_to', value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      return next
    }, { replace: true })
  }

  const changePage = (page: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (page > 1) next.set('page', String(page))
      else next.delete('page')
      return next
    })
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return <EmptyState description="El identificador del proyecto no es válido." icon={<AlertTriangle size={30} />} title="Actividad no disponible" />
  }

  return (
    <section>
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}`}>
        <ArrowLeft aria-hidden="true" size={17} />
        {projectQuery.data?.name ?? 'Proyecto'}
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold text-zinc-950">Actividad</h1>
        <p className="mt-1 text-sm text-zinc-600">Historial de cambios y avances del proyecto.</p>
      </div>

      <div className="mt-6 grid gap-4 rounded-md border border-zinc-200 bg-white p-4 sm:grid-cols-3">
        <label className="text-sm font-medium text-zinc-700">
          Tipo
          <Select className="mt-1.5" onChange={(event) => updateFilter('type', event.target.value)} value={filters.type ?? ''}>
            <option value="">Todos los eventos</option>
            {activityTypes.map((type) => <option key={type} value={type}>{activityTypeLabels[type]}</option>)}
          </Select>
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Desde
          <Input className="mt-1.5" max={filters.date_to} onChange={(event) => updateFilter('date_from', event.target.value)} type="date" value={filters.date_from ?? ''} />
        </label>
        <label className="text-sm font-medium text-zinc-700">
          Hasta
          <Input className="mt-1.5" min={filters.date_from} onChange={(event) => updateFilter('date_to', event.target.value)} type="date" value={filters.date_to ?? ''} />
        </label>
      </div>

      <div className="mt-5">
        {activitiesQuery.isPending ? (
          <ActivitySkeleton />
        ) : activitiesQuery.isError ? (
          <div className="rounded-md border border-red-200 bg-white py-8">
            <EmptyState
              action={<Button onClick={() => void activitiesQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>}
              description={activitiesQuery.error.message}
              icon={<AlertTriangle className="text-red-600" size={30} />}
              title="No pudimos cargar la actividad"
            />
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white py-8">
            <EmptyState
              description="No hay eventos que coincidan con los filtros seleccionados."
              icon={<ActivityIcon size={30} />}
              title="Sin actividad"
            />
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
            <ActivityTimeline activities={activities} />
          </div>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <nav aria-label="Paginación de actividad" className="mt-6 flex items-center justify-center gap-3">
          <button
            aria-label="Página anterior"
            className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={meta.current_page <= 1}
            onClick={() => changePage(meta.current_page - 1)}
            type="button"
          ><ChevronLeft aria-hidden="true" size={18} /></button>
          <span className="min-w-28 text-center text-sm text-zinc-600">Página {meta.current_page} de {meta.last_page}</span>
          <button
            aria-label="Página siguiente"
            className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => changePage(meta.current_page + 1)}
            type="button"
          ><ChevronRight aria-hidden="true" size={18} /></button>
        </nav>
      )}
    </section>
  )
}
