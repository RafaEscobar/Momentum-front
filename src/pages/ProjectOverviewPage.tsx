import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Gauge,
  SquareKanban,
  ListTodo,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { EmptyState } from '@/components/common/EmptyState'
import { ProgressBar } from '@/components/common/ProgressBar'
import { Skeleton } from '@/components/common/Skeleton'
import { ProjectFormModal } from '@/features/projects/components/ProjectFormModal'
import { useProject, useProjectStats } from '@/features/projects/hooks'
import {
  priorityClasses,
  priorityLabels,
  projectStatusLabels,
  projectStatusVariants,
} from '@/features/projects/utils/projectPresentation'

const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(`${value}T00:00:00`)) : 'Sin definir'
}

function OverviewSkeleton() {
  return (
    <div aria-label="Cargando proyecto" className="space-y-6" role="status">
      <Skeleton className="h-5 w-28" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    </div>
  )
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [isEditing, setIsEditing] = useState(false)
  const projectQuery = useProject(projectId)
  const statsQuery = useProjectStats(projectId)

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return (
      <EmptyState
        description="El identificador del proyecto no es válido."
        icon={<AlertTriangle size={30} />}
        title="Proyecto no disponible"
      />
    )
  }

  if (projectQuery.isPending) {
    return <OverviewSkeleton />
  }

  if (projectQuery.isError) {
    return (
      <Card className="py-10">
        <EmptyState
          action={
            <Button onClick={() => void projectQuery.refetch()} size="sm" variant="secondary">
              <RefreshCw aria-hidden="true" size={16} />
              Reintentar
            </Button>
          }
          description={projectQuery.error.message}
          icon={<AlertTriangle className="text-red-600" size={30} />}
          title="No pudimos cargar el proyecto"
        />
      </Card>
    )
  }

  const project = projectQuery.data
  const stats = statsQuery.data
  const taskSummary = stats?.tasks
  const taskStates = taskSummary
    ? [
        { label: 'Backlog', value: taskSummary.backlog },
        { label: 'Por hacer', value: taskSummary.todo },
        { label: 'En progreso', value: taskSummary.in_progress },
        { label: 'Bloqueadas', value: taskSummary.blocked },
        { label: 'Terminadas', value: taskSummary.done },
      ]
    : []

  return (
    <section>
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to="/projects">
        <ArrowLeft aria-hidden="true" size={17} />
        Proyectos
      </Link>

      <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: project.color ?? '#a1a1aa' }} />
            <h1 className="text-2xl font-semibold text-zinc-950">{project.name}</h1>
            <Badge variant={projectStatusVariants[project.status]}>{projectStatusLabels[project.status]}</Badge>
          </div>
          <p className={`mt-2 text-sm font-semibold ${priorityClasses[project.priority]}`}>
            Prioridad {priorityLabels[project.priority].toLowerCase()}
          </p>
          <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-zinc-600">
            {project.description || 'Sin descripción.'}
          </p>
        </div>
        <Button className="shrink-0" onClick={() => setIsEditing(true)} variant="secondary">
          <Pencil aria-hidden="true" size={16} />
          Editar
        </Button>
      </div>

      <nav aria-label="Accesos rápidos del proyecto" className="mt-6 flex flex-wrap gap-2 border-y border-zinc-200 py-4">
        <Link className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900" to={`/projects/${project.id}/backlog?create=task`}><Plus aria-hidden="true" size={17} />Crear tarea</Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100" to={`/projects/${project.id}/backlog`}><ListTodo aria-hidden="true" size={17} />Abrir Backlog</Link>
        <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100" to={`/projects/${project.id}/board`}><SquareKanban aria-hidden="true" size={17} />Abrir Board</Link>
      </nav>

      <div className="mt-7 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Gauge aria-hidden="true" className="text-emerald-700" size={19} />
            Progreso
          </div>
          <p className="mt-5 text-3xl font-semibold text-zinc-950">{stats?.progress ?? project.progress}%</p>
          <div className="mt-3"><ProgressBar value={stats?.progress ?? project.progress} /></div>
          <div className="mt-5 flex justify-between text-xs text-zinc-500">
            <span>{stats?.story_points.completed ?? 0} puntos completados</span>
            <span>{stats?.story_points.total ?? 0} totales</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Rocket aria-hidden="true" className="text-sky-700" size={19} />
            Sprint actual
          </div>
          {statsQuery.isPending ? (
            <div className="mt-5 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ) : stats?.active_sprint ? (
            <div className="mt-5">
              <p className="text-lg font-semibold text-zinc-950">{stats.active_sprint.name}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {formatDate(stats.active_sprint.start_date)} - {formatDate(stats.active_sprint.end_date)}
              </p>
              <div className="mt-4"><ProgressBar label="Progreso del sprint" value={stats.active_sprint.progress_percentage} /></div>
              <Link className="mt-5 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-950" to={`/projects/${project.id}/board`}>
                Abrir tablero
              </Link>
            </div>
          ) : (
            <EmptyState description="Crea o inicia un sprint para planificar el trabajo actual." icon={<Rocket size={25} />} title="Sin sprint activo" />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <CalendarDays aria-hidden="true" className="text-amber-700" size={19} />
            Planificación
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Inicio</dt>
              <dd className="font-medium text-zinc-900">{formatDate(project.start_date)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-zinc-500">Objetivo</dt>
              <dd className="font-medium text-zinc-900">{formatDate(project.target_date)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <ListTodo aria-hidden="true" className="text-violet-700" size={19} />
              Resumen de tareas
            </div>
            <p className="mt-1 text-xs text-zinc-500">{taskSummary?.total ?? 0} tareas en el proyecto</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100" to={`/projects/${project.id}/backlog`}>Backlog</Link>
            <Link className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100" to={`/projects/${project.id}/sprints`}>Sprints</Link>
          </div>
        </div>

        {statsQuery.isPending ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => <Skeleton className="h-20" key={index} />)}
          </div>
        ) : statsQuery.isError ? (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{statsQuery.error.message}</span>
            <Button onClick={() => void statsQuery.refetch()} size="sm" variant="ghost">Reintentar</Button>
          </div>
        ) : (
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {taskStates.map((item) => (
              <div className="rounded-md bg-zinc-50 px-4 py-3" key={item.label}>
                <dt className="text-xs text-zinc-500">{item.label}</dt>
                <dd className="mt-1 text-xl font-semibold text-zinc-950">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      {isEditing && <ProjectFormModal onClose={() => setIsEditing(false)} project={project} />}
    </section>
  )
}
