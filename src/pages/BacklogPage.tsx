import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LoaderCircle,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { useProject } from '@/features/projects/hooks'
import { BacklogTaskRow } from '@/features/tasks/components/BacklogTaskRow'
import { BacklogFiltersBar } from '@/features/tasks/components/BacklogFiltersBar'
import { TaskCreateModal } from '@/features/tasks/components/TaskCreateModal'
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer'
import { useBacklog } from '@/features/tasks/hooks'
import type { Priority } from '@/features/projects/types'
import type { TaskType } from '@/features/tasks/types'

const priorities: Priority[] = ['low', 'medium', 'high', 'critical']
const taskTypes: TaskType[] = ['story', 'task', 'bug', 'improvement']

function parsePage(value: string | null) {
  const page = Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function withAction(searchParams: URLSearchParams, values: Record<string, string>) {
  const next = new URLSearchParams(searchParams)

  next.delete('create')
  next.delete('task')
  next.delete('action')

  for (const [key, value] of Object.entries(values)) {
    next.set(key, value)
  }

  return `?${next.toString()}`
}

function BacklogSkeleton() {
  return (
    <Card aria-label="Cargando backlog" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="flex items-center gap-4 border-b border-zinc-200 px-5 py-5 last:border-b-0" key={index}>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </Card>
  )
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const priorityParam = searchParams.get('priority') as Priority | null
  const typeParam = searchParams.get('type') as TaskType | null
  const priority = priorityParam && priorities.includes(priorityParam) ? priorityParam : undefined
  const type = typeParam && taskTypes.includes(typeParam) ? typeParam : undefined
  const tagParam = Number(searchParams.get('tag'))
  const tagId = Number.isInteger(tagParam) && tagParam > 0 ? tagParam : undefined
  const search = searchParams.get('search')?.slice(0, 255) ?? ''
  const projectQuery = useProject(projectId)
  const backlogQuery = useBacklog(projectId, {
    page,
    priority,
    type,
    search: search || undefined,
    tag_ids: tagId ? [tagId] : undefined,
  })

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return (
      <EmptyState
        description="El identificador del proyecto no es válido."
        icon={<AlertTriangle size={30} />}
        title="Backlog no disponible"
      />
    )
  }

  const backlog = backlogQuery.data?.data ?? []
  const meta = backlogQuery.data?.meta
  const createHref = withAction(searchParams, { create: 'task' })
  const taskId = Number(searchParams.get('task'))
  const isCreateOpen = searchParams.get('create') === 'task'
  const isTaskOpen = Number.isInteger(taskId) && taskId > 0

  const closeOverlay = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('create')
      next.delete('task')
      next.delete('action')
      return next
    }, { replace: true })
  }

  const changePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)

      next.delete('create')
      next.delete('task')
      next.delete('action')

      if (nextPage > 1) {
        next.set('page', String(nextPage))
      } else {
        next.delete('page')
      }

      return next
    })
  }

  const setFilter = (key: 'search' | 'priority' | 'type' | 'tag', value?: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      if (value?.trim()) next.set(key, value.trim())
      else next.delete(key)
      return next
    }, { replace: key === 'search' })
  }

  const clearFilters = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      for (const key of ['search', 'priority', 'type', 'tag', 'page']) next.delete(key)
      return next
    })
  }

  return (
    <section>
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
        to={`/projects/${projectId}`}
      >
        <ArrowLeft aria-hidden="true" size={17} />
        {projectQuery.data?.name ?? 'Proyecto'}
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-950">Backlog</h1>
            {backlogQuery.isFetching && !backlogQuery.isPending && (
              <LoaderCircle aria-label="Actualizando backlog" className="animate-spin text-zinc-400" size={17} />
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-600">
            {meta
              ? `${meta.total} ${meta.total === 1 ? 'tarea' : 'tareas'} · ${meta.story_points_total} puntos`
              : 'Tareas pendientes de planificación'}
          </p>
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 sm:self-auto"
          to={createHref}
        >
          <Plus aria-hidden="true" size={18} />
          Crear tarea
        </Link>
      </div>

      <BacklogFiltersBar
        key={search}
        onClear={clearFilters}
        onPriorityChange={(value) => setFilter('priority', value)}
        onSearchChange={(value) => setFilter('search', value)}
        onTagChange={(value) => setFilter('tag', value ? String(value) : undefined)}
        onTypeChange={(value) => setFilter('type', value)}
        priority={priority}
        search={search}
        tagId={tagId}
        type={type}
      />

      <div className="mt-6">
        {backlogQuery.isPending ? (
          <BacklogSkeleton />
        ) : backlogQuery.isError ? (
          <Card className="py-10">
            <EmptyState
              action={
                <Button onClick={() => void backlogQuery.refetch()} size="sm" variant="secondary">
                  <RefreshCw aria-hidden="true" size={16} />
                  Reintentar
                </Button>
              }
              description={backlogQuery.error.message}
              icon={<AlertTriangle className="text-red-600" size={30} />}
              title="No pudimos cargar el backlog"
            />
          </Card>
        ) : backlog.length === 0 ? (
          <Card>
            <EmptyState
              action={
                <Link
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-800 px-3 text-sm font-semibold text-white hover:bg-emerald-900"
                  to={createHref}
                >
                  <Plus aria-hidden="true" size={16} />
                  Crear tarea
                </Link>
              }
              description="Las tareas sin Sprint aparecerán aquí."
              icon={<ClipboardList size={30} />}
              title="El backlog está vacío"
            />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            {backlog.map((task) => (
              <BacklogTaskRow
                assignHref={withAction(searchParams, { task: String(task.id), action: 'assign-sprint' })}
                editHref={withAction(searchParams, { task: String(task.id), action: 'edit' })}
                key={task.id}
                task={task}
              />
            ))}
          </Card>
        )}
      </div>

      {meta && meta.last_page > 1 && (
        <nav aria-label="Paginación del backlog" className="mt-6 flex items-center justify-center gap-3">
          <Button
            aria-label="Página anterior"
            disabled={meta.current_page <= 1}
            onClick={() => changePage(meta.current_page - 1)}
            size="icon"
            variant="secondary"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </Button>
          <span className="min-w-28 text-center text-sm text-zinc-600">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <Button
            aria-label="Página siguiente"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => changePage(meta.current_page + 1)}
            size="icon"
            variant="secondary"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </Button>
        </nav>
      )}

      {isCreateOpen && <TaskCreateModal onClose={closeOverlay} projectId={projectId} />}
      {isTaskOpen && <TaskDetailDrawer onClose={closeOverlay} projectId={projectId} taskId={taskId} />}
    </section>
  )
}
