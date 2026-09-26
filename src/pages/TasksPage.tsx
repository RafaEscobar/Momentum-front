import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, ListChecks, LoaderCircle, RefreshCw } from 'lucide-react'
import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { useProject } from '@/features/projects/hooks'
import type { Priority } from '@/features/projects/types'
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer'
import { TaskFilters } from '@/features/tasks/components/TaskFilters'
import { useTasks } from '@/features/tasks/hooks'
import type { TaskStatus, TaskType } from '@/features/tasks/types'
import { taskPriorityLabels, taskPriorityVariants, taskTypeLabels, taskTypeVariants } from '@/features/tasks/utils/taskPresentation'

const statuses: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'blocked', 'done']
const priorities: Priority[] = ['low', 'medium', 'high', 'critical']
const types: TaskType[] = ['story', 'task', 'bug', 'improvement']
const statusLabels: Record<TaskStatus, string> = { backlog: 'Backlog', todo: 'Por hacer', in_progress: 'En progreso', blocked: 'Bloqueada', done: 'Terminada' }

function positiveNumber(value: string | null) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : undefined
}

function TasksSkeleton() {
  return <Card aria-label="Cargando tareas" role="status">{[0, 1, 2, 3, 4].map((item) => <div className="flex gap-4 border-b border-zinc-200 p-5 last:border-b-0" key={item}><Skeleton className="h-5 flex-1" /><Skeleton className="h-5 w-20" /><Skeleton className="h-5 w-20" /></div>)}</Card>
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = positiveNumber(searchParams.get('page')) ?? 1
  const statusValue = searchParams.get('status') as TaskStatus | null
  const priorityValue = searchParams.get('priority') as Priority | null
  const typeValue = searchParams.get('type') as TaskType | null
  const status = statusValue && statuses.includes(statusValue) ? statusValue : undefined
  const priority = priorityValue && priorities.includes(priorityValue) ? priorityValue : undefined
  const type = typeValue && types.includes(typeValue) ? typeValue : undefined
  const sprintId = positiveNumber(searchParams.get('sprint'))
  const tagId = positiveNumber(searchParams.get('tag'))
  const search = searchParams.get('search')?.slice(0, 255) ?? ''
  const taskId = positiveNumber(searchParams.get('task'))
  const projectQuery = useProject(projectId)
  const tasksQuery = useTasks(projectId, { page, status, priority, type, sprint_id: sprintId, tag_id: tagId, search: search || undefined })
  const tasks = tasksQuery.data?.data ?? []
  const meta = tasksQuery.data?.meta

  const setFilter = useCallback((key: 'search' | 'status' | 'priority' | 'type' | 'sprint' | 'tag', value?: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('page')
      if (value?.trim()) next.set(key, value.trim())
      else next.delete(key)
      return next
    }, { replace: key === 'search' })
  }, [setSearchParams])

  const clearFilters = () => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    for (const key of ['search', 'status', 'priority', 'type', 'sprint', 'tag', 'page']) next.delete(key)
    return next
  })
  const changePage = (nextPage: number) => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page')
    return next
  })
  const closeTask = () => setSearchParams((current) => { const next = new URLSearchParams(current); next.delete('task'); return next }, { replace: true })

  if (!Number.isInteger(projectId) || projectId <= 0) return <EmptyState description="El identificador del proyecto no es válido." icon={<AlertTriangle size={30} />} title="Tareas no disponibles" />

  return <section>
    <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}`}><ArrowLeft size={17} />{projectQuery.data?.name ?? 'Proyecto'}</Link>
    <div className="mt-5 flex items-end justify-between gap-4"><div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold text-zinc-950">Tareas</h1>{tasksQuery.isFetching && !tasksQuery.isPending && <LoaderCircle aria-label="Actualizando tareas" className="animate-spin text-zinc-400" size={17} />}</div><p className="mt-1 text-sm text-zinc-600">{meta ? `${meta.total} ${meta.total === 1 ? 'tarea' : 'tareas'}` : 'Todas las tareas del proyecto'}</p></div></div>
    <TaskFilters key={search} onChange={setFilter} onClear={clearFilters} priority={priority} projectId={projectId} search={search} sprintId={sprintId} status={status} tagId={tagId} type={type} />
    <div className="mt-6">{tasksQuery.isPending ? <TasksSkeleton /> : tasksQuery.isError ? <Card className="py-8"><EmptyState action={<Button onClick={() => void tasksQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>} description={tasksQuery.error.message} icon={<AlertTriangle className="text-red-600" size={30} />} title="No pudimos cargar las tareas" /></Card> : tasks.length === 0 ? <Card><EmptyState description="No hay tareas que coincidan con los filtros seleccionados." icon={<ListChecks size={30} />} title="Sin tareas" /></Card> : <Card className="overflow-hidden">{tasks.map((task) => <Link className="flex flex-col gap-3 border-b border-zinc-200 p-4 last:border-b-0 hover:bg-zinc-50 sm:flex-row sm:items-center" key={task.id} to={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), task: String(task.id) })}`}><span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-950">{task.title}</span><div className="flex flex-wrap gap-2"><Badge variant={taskTypeVariants[task.type]}>{taskTypeLabels[task.type]}</Badge><Badge variant={taskPriorityVariants[task.priority]}>{taskPriorityLabels[task.priority]}</Badge><Badge>{statusLabels[task.status]}</Badge></div><span className="text-xs font-semibold text-zinc-500">{task.story_points ?? 0} pts</span></Link>)}</Card>}</div>
    {meta && meta.last_page > 1 && <nav aria-label="Paginación de tareas" className="mt-6 flex items-center justify-center gap-3"><Button aria-label="Página anterior" disabled={meta.current_page <= 1} onClick={() => changePage(meta.current_page - 1)} size="icon" variant="secondary"><ChevronLeft size={18} /></Button><span className="min-w-28 text-center text-sm text-zinc-600">Página {meta.current_page} de {meta.last_page}</span><Button aria-label="Página siguiente" disabled={meta.current_page >= meta.last_page} onClick={() => changePage(meta.current_page + 1)} size="icon" variant="secondary"><ChevronRight size={18} /></Button></nav>}
    {taskId && <TaskDetailDrawer onClose={closeTask} projectId={projectId} taskId={taskId} />}
  </section>
}
