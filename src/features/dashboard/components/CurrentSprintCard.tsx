import { ArrowRight, CalendarRange } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Skeleton } from '@/components/common/Skeleton'
import { StoryPointsSummary } from '@/features/sprints/components/StoryPointsSummary'
import { useSprint } from '@/features/sprints/hooks'
import type { SprintSummary } from '@/features/sprints/types'

interface CurrentSprintCardProps {
  projectName: string
  sprint: SprintSummary
}

export function CurrentSprintCard({ projectName, sprint }: CurrentSprintCardProps) {
  const sprintQuery = useSprint(sprint.project_id, sprint.id)

  return (
    <article className="flex min-h-64 flex-col rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800">
          <CalendarRange aria-hidden="true" size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-zinc-950">{sprint.name}</h3>
          <p className="mt-1 truncate text-sm text-zinc-600">{projectName}</p>
        </div>
      </div>

      <div className="mt-5 min-h-12">
        <p className="text-xs font-medium text-zinc-500">Objetivo</p>
        {sprintQuery.isPending ? (
          <Skeleton aria-label={`Cargando objetivo de ${sprint.name}`} className="mt-2 h-4 w-4/5" />
        ) : (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-700">
            {sprintQuery.isError
              ? 'No se pudo cargar el objetivo.'
              : sprintQuery.data.goal || 'Sin objetivo definido.'}
          </p>
        )}
      </div>

      <div className="mt-5">
        <StoryPointsSummary
          completed={sprint.completed_points}
          label={`Progreso de ${sprint.name}`}
          percentage={sprint.progress_percentage}
          total={sprint.planned_points}
        />
      </div>

      <Link
        className="mt-auto flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        to={`/projects/${sprint.project_id}/board?sprint=${sprint.id}`}
      >
        Abrir Board
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </article>
  )
}
