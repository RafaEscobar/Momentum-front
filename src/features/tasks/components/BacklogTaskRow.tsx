import { CalendarPlus, GripVertical, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/common/Badge'
import type { BacklogTask } from '@/features/tasks/types'
import {
  taskPriorityLabels,
  taskPriorityVariants,
  taskTypeLabels,
  taskTypeVariants,
} from '@/features/tasks/utils/taskPresentation'

interface BacklogTaskRowProps {
  task: BacklogTask
  editHref: string
  assignHref: string
}

export function BacklogTaskRow({ task, editHref, assignHref }: BacklogTaskRowProps) {
  return (
    <article className="grid gap-4 border-b border-zinc-200 px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 hidden text-zinc-300 sm:block" title={`Posición ${task.position}`}>
          <GripVertical aria-hidden="true" size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={taskPriorityVariants[task.priority]}>
              {taskPriorityLabels[task.priority]}
            </Badge>
            <Badge variant={taskTypeVariants[task.type]}>{taskTypeLabels[task.type]}</Badge>
            <h2 className="min-w-0 text-sm font-semibold text-zinc-950 sm:truncate">{task.title}</h2>
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600" key={tag.id}>
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="min-w-14 text-sm font-semibold text-zinc-700">
          {task.story_points === null ? 'Sin pts' : `${task.story_points} pts`}
        </span>
        <div className="flex items-center gap-1">
          <Link
            aria-label={`Asignar ${task.title} a un Sprint`}
            className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            title="Asignar a Sprint"
            to={assignHref}
          >
            <CalendarPlus aria-hidden="true" size={17} />
          </Link>
          <Link
            aria-label={`Editar tarea ${task.title}`}
            className="grid size-9 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
            title="Editar tarea"
            to={editHref}
          >
            <Pencil aria-hidden="true" size={17} />
          </Link>
        </div>
      </div>
    </article>
  )
}
