import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { CheckSquare, GripVertical } from 'lucide-react'
import { memo } from 'react'

import { Badge } from '@/components/common/Badge'
import type { BoardTask, TaskStatus } from '@/features/tasks/types'
import { taskPriorityLabels, taskPriorityVariants, taskTypeLabels, taskTypeVariants } from '@/features/tasks/utils/taskPresentation'

interface TaskCardProps {
  task: BoardTask
  status: TaskStatus
  onOpen: (taskId: number) => void
  overlay?: boolean
  readOnly?: boolean
  onStatusChange?: (taskId: number, status: Exclude<TaskStatus, 'backlog'>) => void
}

export const TaskCard = memo(function TaskCard({ task, status, onOpen, onStatusChange, overlay = false, readOnly = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: overlay ? `overlay-${task.id}` : task.id,
    data: { type: 'task', status },
    disabled: overlay || readOnly,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return <article className={`rounded-md border border-zinc-200 bg-white p-3 shadow-sm ${isDragging ? 'opacity-30' : ''} ${overlay ? 'w-72 shadow-xl' : ''}`} ref={setNodeRef} style={style}>
    <div className="flex items-start gap-2">{!readOnly && <button aria-label={`Mover ${task.title}`} className="mt-0.5 hidden cursor-grab touch-none rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:cursor-grabbing lg:inline-grid" type="button" {...attributes} {...listeners}><GripVertical size={16} /></button>}<button className="min-w-0 flex-1 text-left" onClick={() => onOpen(task.id)} type="button"><span className="line-clamp-2 text-sm font-semibold text-zinc-900">{task.title}</span></button></div>
    <div className="mt-3 flex flex-wrap items-center gap-2"><Badge variant={taskPriorityVariants[task.priority]}>{taskPriorityLabels[task.priority]}</Badge><Badge variant={taskTypeVariants[task.type]}>{taskTypeLabels[task.type]}</Badge><span className="ml-auto text-xs font-semibold text-zinc-500">{task.story_points ?? 0} pts</span></div>
    {task.tags && task.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{task.tags.map((tag) => <span className="inline-flex items-center gap-1 text-xs text-zinc-600" key={tag.id}><span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />{tag.name}</span>)}</div>}
    {task.checklist.total > 0 && <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500"><CheckSquare size={14} /><span>{task.checklist.completed}/{task.checklist.total} checklist</span></div>}
    {!readOnly && !overlay && onStatusChange && <select aria-label={`Cambiar estado de ${task.title}`} className="mt-3 h-9 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 lg:hidden" onChange={(event) => onStatusChange(task.id, event.target.value as Exclude<TaskStatus, 'backlog'>)} value={status}><option value="todo">Por hacer</option><option value="in_progress">En progreso</option><option value="blocked">Bloqueada</option><option value="done">Terminada</option></select>}
  </article>
})
