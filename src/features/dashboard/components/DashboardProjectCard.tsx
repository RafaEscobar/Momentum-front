import { ArrowRight, CalendarDays, FolderKanban } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import type { ProjectSummary } from '@/features/projects/types'
import {
  priorityClasses,
  priorityLabels,
  projectStatusLabels,
  projectStatusVariants,
} from '@/features/projects/utils/projectPresentation'
import type { SprintSummary } from '@/features/sprints/types'

interface DashboardProjectCardProps {
  project: ProjectSummary
  currentSprint?: SprintSummary
}

export function DashboardProjectCard({ project, currentSprint }: DashboardProjectCardProps) {
  const progress = Math.min(100, Math.max(0, project.progress))

  return (
    <article className="flex min-h-64 flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="h-1.5" style={{ backgroundColor: project.color ?? '#a1a1aa' }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-zinc-100 text-zinc-600">
              <FolderKanban aria-hidden="true" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-zinc-950">{project.name}</h3>
              <p className={`mt-1 text-xs font-semibold ${priorityClasses[project.priority]}`}>
                Prioridad {priorityLabels[project.priority].toLowerCase()}
              </p>
            </div>
          </div>
          <Badge variant={projectStatusVariants[project.status]}>{projectStatusLabels[project.status]}</Badge>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-600">Progreso</span>
            <span className="font-semibold text-zinc-900">{progress}%</span>
          </div>
          <ProgressBar label={`Progreso de ${project.name}`} value={progress} />
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-zinc-100 pt-4 text-sm">
          <CalendarDays aria-hidden="true" className="shrink-0 text-zinc-400" size={16} />
          <span className="text-zinc-500">Sprint actual</span>
          <span className="ml-auto truncate font-medium text-zinc-900">
            {currentSprint?.name ?? 'Sin sprint activo'}
          </span>
        </div>

        <Link
          className="mt-auto flex h-9 items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          to={`/projects/${project.id}`}
        >
          Abrir
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>
    </article>
  )
}
