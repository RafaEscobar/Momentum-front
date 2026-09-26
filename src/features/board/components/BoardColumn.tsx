import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { memo } from 'react'

import { TaskCard } from '@/features/board/components/TaskCard'
import type { BoardTask, TaskStatus } from '@/features/tasks/types'

interface BoardColumnProps {
  title: string
  status: TaskStatus
  tasks: BoardTask[]
  count: number
  storyPoints: number
  onTaskOpen: (taskId: number) => void
  readOnly?: boolean
  onStatusChange?: (taskId: number, status: Exclude<TaskStatus, 'backlog'>) => void
}

export const BoardColumn = memo(function BoardColumn({ title, status, tasks, count, storyPoints, onTaskOpen, onStatusChange, readOnly = false }: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `column-${status}`, data: { type: 'column', status }, disabled: readOnly })

  return <section aria-labelledby={`board-${status}`} className={`flex min-h-80 w-[18rem] shrink-0 flex-col rounded-md p-3 transition-colors lg:w-auto lg:min-w-0 ${isOver ? 'bg-emerald-50 ring-2 ring-emerald-300' : 'bg-zinc-100'}`} ref={setNodeRef}>
    <header className="flex h-12 items-start justify-between gap-3 px-1"><div><h2 className="text-sm font-semibold text-zinc-900" id={`board-${status}`}>{title}</h2><p className="mt-0.5 text-xs text-zinc-500">{count} {count === 1 ? 'tarea' : 'tareas'}</p></div><span className="shrink-0 text-xs font-semibold text-zinc-600">{storyPoints} pts</span></header>
    <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}><div className="mt-2 space-y-2">{tasks.length === 0 ? <div className="grid min-h-24 place-items-center rounded-md border border-dashed border-zinc-300 px-4 text-center text-xs text-zinc-500">Sin tareas</div> : tasks.map((task) => <TaskCard key={task.id} onOpen={onTaskOpen} onStatusChange={onStatusChange} readOnly={readOnly} status={status} task={task} />)}</div></SortableContext>
  </section>
})
