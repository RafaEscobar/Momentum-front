import { ArrowRight, CheckCircle2, CirclePause, FolderKanban, ListChecks, Pencil } from 'lucide-react'
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

interface ProjectCardProps {
  project: ProjectSummary
  onEdit: (project: ProjectSummary) => void
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const progress = Math.min(100, Math.max(0, project.progress))

  return (
    <article className="flex min-h-56 flex-col overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <div className="h-1.5" style={{ backgroundColor: project.color ?? '#a1a1aa' }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-zinc-100 text-zinc-600">
              <FolderKanban aria-hidden="true" size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-zinc-950">{project.name}</h2>
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
          <ProgressBar value={progress} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            {project.status === 'completed' ? (
              <CheckCircle2 aria-hidden="true" size={15} />
            ) : project.status === 'paused' ? (
              <CirclePause aria-hidden="true" size={15} />
            ) : (
              <ListChecks aria-hidden="true" size={15} />
            )}
            <span>
              {project.tasks_count === undefined
                ? 'Tareas sin contabilizar'
                : `${project.tasks_count} ${project.tasks_count === 1 ? 'tarea' : 'tareas'}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label={`Editar proyecto ${project.name}`}
              className="grid size-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              onClick={() => onEdit(project)}
              title="Editar proyecto"
              type="button"
            >
              <Pencil aria-hidden="true" size={16} />
            </button>
            <Link
              aria-label={`Abrir proyecto ${project.name}`}
              className="flex h-9 items-center gap-2 rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              to={`/projects/${project.id}`}
            >
              Abrir
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
