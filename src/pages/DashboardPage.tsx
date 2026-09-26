import { AlertTriangle, ArrowRight, FolderOpen, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ActivityTimeline } from '@/features/activity/components/ActivityTimeline'
import { CurrentSprintCard } from '@/features/dashboard/components/CurrentSprintCard'
import { DashboardProjectCard } from '@/features/dashboard/components/DashboardProjectCard'
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'
import { DashboardSummary } from '@/features/dashboard/components/DashboardSummary'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'

export function Component() {
  const dashboardQuery = useDashboard()

  if (dashboardQuery.isPending) {
    return <DashboardSkeleton />
  }

  if (dashboardQuery.isError) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-red-200 bg-white px-6 text-center">
        <AlertTriangle aria-hidden="true" className="text-red-600" size={28} />
        <h1 className="mt-3 text-base font-semibold text-zinc-950">No pudimos cargar el dashboard</h1>
        <p className="mt-1 max-w-md text-sm text-zinc-600">{dashboardQuery.error.message}</p>
        <button
          className="mt-5 flex h-9 items-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700"
          onClick={() => void dashboardQuery.refetch()}
          type="button"
        >
          <RefreshCw aria-hidden="true" size={16} />
          Reintentar
        </button>
      </div>
    )
  }

  const {
    active_sprints: activeSprints,
    projects,
    recent_activity: recentActivity,
    summary,
  } = dashboardQuery.data
  const projectNames = new Map(projects.map((project) => [project.id, project.name]))
  const activeSprintByProject = new Map(activeSprints.map((sprint) => [sprint.project_id, sprint]))

  return (
    <section>
      <header>
        <h1 className="text-2xl font-semibold text-zinc-950">Buen día</h1>
        <p className="mt-1 text-sm text-zinc-600">Este es el estado actual de tu trabajo.</p>
      </header>

      <div className="mt-6"><DashboardSummary summary={summary} /></div>

      <section aria-labelledby="dashboard-projects-title" className="mt-9">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-950" id="dashboard-projects-title">Proyectos</h2>
          <Link className="flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950" to="/projects">
            Ver todos <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="mt-4 rounded-md border border-zinc-200 bg-white px-6 py-10 text-center">
            <FolderOpen aria-hidden="true" className="mx-auto text-zinc-400" size={28} />
            <p className="mt-3 text-sm font-semibold text-zinc-950">No hay proyectos activos</p>
            <p className="mt-1 text-sm text-zinc-600">Tus proyectos activos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <DashboardProjectCard
                currentSprint={activeSprintByProject.get(project.id)}
                key={project.id}
                project={project}
              />
            ))}
          </div>
        )}
      </section>

      <div className="mt-9 grid gap-8 xl:grid-cols-2">
        <section aria-labelledby="active-sprints-title">
          <h2 className="text-lg font-semibold text-zinc-950" id="active-sprints-title">Sprints activos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {activeSprints.length === 0 ? (
              <p className="rounded-md border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500">No hay sprints activos.</p>
            ) : activeSprints.map((sprint) => (
              <CurrentSprintCard
                key={sprint.id}
                projectName={projectNames.get(sprint.project_id) ?? `Proyecto ${sprint.project_id}`}
                sprint={sprint}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="recent-activity-title">
          <h2 className="text-lg font-semibold text-zinc-950" id="recent-activity-title">Actividad reciente</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-zinc-200 bg-white">
            {recentActivity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-zinc-500">Todavía no hay actividad reciente.</p>
            ) : <ActivityTimeline activities={recentActivity} projectNames={projectNames} />}
          </div>
        </section>
      </div>
    </section>
  )
}
