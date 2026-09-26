import { AlertTriangle, ArrowLeft, CalendarRange, Plus, RefreshCw } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { useProject } from '@/features/projects/hooks'
import { CompletedSprintCard } from '@/features/sprints/components/CompletedSprintCard'
import { SprintCard } from '@/features/sprints/components/SprintCard'
import { SprintFormModal } from '@/features/sprints/components/SprintFormModal'
import { useSprints } from '@/features/sprints/hooks'
import type { SprintSummary } from '@/features/sprints/types'

function SprintSection({ title, description, projectId, sprints }: { title: string; description: string; projectId: number; sprints: SprintSummary[] }) {
  return <section className="border-t border-zinc-200 py-7 first:border-t-0 first:pt-0">
    <div><h2 className="text-lg font-semibold text-zinc-950">{title}</h2><p className="mt-1 text-sm text-zinc-600">{description}</p></div>
    {sprints.length === 0 ? <div className="mt-4 border-l-2 border-zinc-200 py-3 pl-4 text-sm text-zinc-500">No hay Sprints en esta sección.</div> : <div className="mt-5 grid gap-4 xl:grid-cols-2">{sprints.map((sprint) => <SprintCard key={sprint.id} projectId={projectId} sprint={sprint} />)}</div>}
  </section>
}

function CompletedSprintsSection({ sprints }: { sprints: SprintSummary[] }) {
  return <section className="border-t border-zinc-200 py-7">
    <div><h2 className="text-lg font-semibold text-zinc-950">Sprints completados</h2><p className="mt-1 text-sm text-zinc-600">Historial de iteraciones finalizadas.</p></div>
    {sprints.length === 0 ? <div className="mt-4 border-l-2 border-zinc-200 py-3 pl-4 text-sm text-zinc-500">No hay Sprints en esta sección.</div> : <div className="mt-5 grid gap-4 xl:grid-cols-2">{sprints.map((sprint) => <CompletedSprintCard key={sprint.id} sprint={sprint} />)}</div>}
  </section>
}

function SprintsSkeleton() {
  return <div aria-label="Cargando Sprints" className="grid gap-4 xl:grid-cols-2" role="status">{Array.from({ length: 4 }, (_, index) => <div className="rounded-md border border-zinc-200 bg-white p-5" key={index}><Skeleton className="h-6 w-40" /><Skeleton className="mt-4 h-4 w-56" /><Skeleton className="mt-7 h-12 w-full" /><Skeleton className="mt-5 h-2 w-full" /></div>)}</div>
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const projectQuery = useProject(projectId)
  const activeQuery = useSprints(projectId, { status: 'active' })
  const plannedQuery = useSprints(projectId, { status: 'planned' })
  const completedQuery = useSprints(projectId, { status: 'completed' })
  const queries = [activeQuery, plannedQuery, completedQuery]
  const isPending = queries.some((query) => query.isPending)
  const failedQuery = queries.find((query) => query.isError)

  if (!Number.isInteger(projectId) || projectId <= 0) return <EmptyState description="El identificador del proyecto no es válido." icon={<AlertTriangle size={30} />} title="Sprints no disponibles" />

  const total = (activeQuery.data?.data.length ?? 0) + (plannedQuery.data?.data.length ?? 0) + (completedQuery.data?.data.length ?? 0)
  const showCreate = searchParams.get('create') === 'sprint'
  const closeCreate = () => setSearchParams((current) => {
    const next = new URLSearchParams(current)
    next.delete('create')
    return next
  }, { replace: true })

  return <section>
    <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}`}><ArrowLeft size={17} />{projectQuery.data?.name ?? 'Proyecto'}</Link>
    <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-semibold text-zinc-950">Sprints</h1><p className="mt-1 text-sm text-zinc-600">Planificación y seguimiento de iteraciones.</p></div><Link className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900 sm:self-auto" to="?create=sprint"><Plus size={18} />Crear Sprint</Link></div>
    <div className="mt-7">{isPending ? <SprintsSkeleton /> : failedQuery ? <EmptyState action={<Button onClick={() => queries.forEach((query) => void query.refetch())} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>} description={failedQuery.error.message} icon={<AlertTriangle className="text-red-600" size={30} />} title="No pudimos cargar los Sprints" /> : total === 0 ? <EmptyState description="Los Sprints que planifiques aparecerán aquí." icon={<CalendarRange size={30} />} title="Todavía no hay Sprints" /> : <>
      <SprintSection description="La iteración que se encuentra actualmente en ejecución." projectId={projectId} sprints={activeQuery.data?.data ?? []} title="Sprint activo" />
      <SprintSection description="Iteraciones preparadas para comenzar." projectId={projectId} sprints={plannedQuery.data?.data ?? []} title="Sprints planificados" />
      <CompletedSprintsSection sprints={completedQuery.data?.data ?? []} />
    </>}</div>
    {showCreate && <SprintFormModal onClose={closeCreate} projectId={projectId} />}
  </section>
}
