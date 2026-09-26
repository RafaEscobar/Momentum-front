import { DndContext, DragOverlay, PointerSensor, KeyboardSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { AlertTriangle, ArrowLeft, ClipboardList, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Select } from '@/components/common/Select'
import { Skeleton } from '@/components/common/Skeleton'
import { BoardColumn } from '@/features/board/components/BoardColumn'
import { TaskCard } from '@/features/board/components/TaskCard'
import { useBoard } from '@/features/board/hooks/useBoard'
import { useReorderBoard } from '@/features/board/hooks/useReorderBoard'
import { findBoardTask, moveTask } from '@/features/board/utils/boardState'
import type { BoardStatus } from '@/features/board/utils/boardState'
import { useProject } from '@/features/projects/hooks'
import { useSprints } from '@/features/sprints/hooks'
import { StoryPointsSummary } from '@/features/sprints/components/StoryPointsSummary'
import { TaskDetailDrawer } from '@/features/tasks/components/TaskDetailDrawer'
import { useChangeTaskStatus } from '@/features/tasks/hooks'
import type { BoardTask, TaskStatus } from '@/features/tasks/types'

const columns: Array<{ status: Exclude<TaskStatus, 'backlog'>; title: string }> = [
  { status: 'todo', title: 'Por hacer' },
  { status: 'in_progress', title: 'En progreso' },
  { status: 'blocked', title: 'Bloqueadas' },
  { status: 'done', title: 'Terminadas' },
]

function points(tasks: BoardTask[]) {
  return tasks.reduce((total, task) => total + (task.story_points ?? 0), 0)
}

function BoardSkeleton() {
  return <div aria-label="Cargando Board" className="flex gap-4 overflow-hidden lg:grid lg:grid-cols-4" role="status">{columns.map((column) => <div className="h-96 w-72 shrink-0 rounded-md bg-zinc-100 p-3 lg:w-auto" key={column.status}><Skeleton className="h-5 w-28" /><Skeleton className="mt-8 h-24 w-full" /><Skeleton className="mt-3 h-24 w-full" /></div>)}</div>
}

export function Component() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const [searchParams, setSearchParams] = useSearchParams()
  const sprintParam = Number(searchParams.get('sprint'))
  const sprintId = Number.isInteger(sprintParam) && sprintParam > 0 ? sprintParam : undefined
  const taskId = Number(searchParams.get('task'))
  const isTaskOpen = Number.isInteger(projectId) && projectId > 0 && Number.isInteger(taskId) && taskId > 0
  const projectQuery = useProject(projectId)
  const boardQuery = useBoard(projectId, sprintId)
  const activeSprintsQuery = useSprints(projectId, { status: 'active' })
  const plannedSprintsQuery = useSprints(projectId, { status: 'planned' })
  const completedSprintsQuery = useSprints(projectId, { status: 'completed' })
  const sprintOptions = [...(activeSprintsQuery.data?.data ?? []), ...(plannedSprintsQuery.data?.data ?? []), ...(completedSprintsQuery.data?.data ?? [])]
    .filter((sprint, index, items) => items.findIndex((item) => item.id === sprint.id) === index)
  const reorderMutation = useReorderBoard()
  const { mutate: mutateStatus } = useChangeTaskStatus()
  const [activeTask, setActiveTask] = useState<BoardTask | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const openTask = useCallback((selectedTaskId: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('task', String(selectedTaskId))
      next.set('action', 'edit')
      return next
    })
  }, [setSearchParams])

  const closeTask = () => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('task')
      next.delete('action')
      return next
    }, { replace: true })
  }

  const handleDragStart = (event: DragStartEvent) => {
    if (!boardQuery.data) return
    setActiveTask(findBoardTask(boardQuery.data, Number(event.active.id))?.task ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    if (!boardQuery.data || boardQuery.data.sprint?.status === 'completed' || !event.over || reorderMutation.isPending) return
    const targetStatus = event.over.data.current?.status as BoardStatus | undefined
    if (!targetStatus) return
    const moved = moveTask(boardQuery.data, Number(event.active.id), targetStatus, event.over.id)
    if (!moved) return
    const changed = new Set(moved.changedStatuses)
    const tasks = columns.flatMap(({ status }) => changed.has(status) ? moved.board[status].map((task) => ({ id: task.id, status, position: task.position })) : [])
    reorderMutation.mutate({ projectId, sprintId, tasks, previousBoard: boardQuery.data, nextBoard: moved.board })
  }

  const changeSprint = (value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('task')
      next.delete('action')
      if (value) next.set('sprint', value)
      else next.delete('sprint')
      return next
    })
  }

  const changeStatus = useCallback((selectedTaskId: number, status: BoardStatus) => {
    mutateStatus({ projectId, taskId: selectedTaskId, status })
  }, [mutateStatus, projectId])

  if (!Number.isInteger(projectId) || projectId <= 0) return <EmptyState description="El identificador del proyecto no es válido." icon={<AlertTriangle size={30} />} title="Board no disponible" />

  return <section>
    <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}`}><ArrowLeft size={17} />{projectQuery.data?.name ?? 'Proyecto'}</Link>
    <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold text-zinc-950">Board</h1>{boardQuery.data?.sprint?.status === 'completed' && <Badge>Solo lectura</Badge>}</div><p className="mt-1 text-sm text-zinc-600">{boardQuery.data?.sprint?.name ?? 'Sprint activo'}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><label className="text-sm font-medium text-zinc-700" htmlFor="board-sprint">Sprint</label><Select className="min-w-52" disabled={activeSprintsQuery.isPending || plannedSprintsQuery.isPending || completedSprintsQuery.isPending} id="board-sprint" onChange={(event) => changeSprint(event.target.value)} value={sprintId ?? ''}><option value="">Sprint activo</option>{sprintOptions.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}{sprint.status === 'completed' ? ' (completado)' : sprint.status === 'planned' ? ' (planificado)' : ' (activo)'}</option>)}</Select>{boardQuery.data && boardQuery.data.backlog.length > 0 && <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950" to={`/projects/${projectId}/backlog`}><ClipboardList size={17} />{boardQuery.data.backlog.length} en Backlog</Link>}</div></div>
    {boardQuery.data?.sprint && <div className="mt-5 max-w-md"><StoryPointsSummary completed={boardQuery.data.sprint.completed_points} percentage={boardQuery.data.sprint.progress_percentage} total={boardQuery.data.sprint.planned_points} /></div>}
    <div className="mt-7">{boardQuery.isPending ? <BoardSkeleton /> : boardQuery.isError ? <EmptyState action={<Button onClick={() => void boardQuery.refetch()} size="sm" variant="secondary"><RefreshCw size={16} />Reintentar</Button>} description={boardQuery.error.message} icon={<AlertTriangle className="text-red-600" size={30} />} title="No pudimos cargar el Board" /> : !boardQuery.data.sprint ? <EmptyState action={<Link className="inline-flex h-9 items-center rounded-md bg-emerald-800 px-3 text-sm font-semibold text-white hover:bg-emerald-900" to={`/projects/${projectId}/sprints`}>Ver Sprints</Link>} description="Inicia un Sprint para comenzar a trabajar con el Board." icon={<ClipboardList size={30} />} title="No hay un Sprint activo" /> : <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}><div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">{columns.map((column) => {
      const tasks = boardQuery.data[column.status]
      return <BoardColumn count={tasks.length} key={column.status} onStatusChange={changeStatus} onTaskOpen={openTask} readOnly={boardQuery.data.sprint?.status === 'completed'} status={column.status} storyPoints={points(tasks)} tasks={tasks} title={column.title} />
    })}</div><DragOverlay>{activeTask ? <TaskCard onOpen={openTask} overlay status={activeTask.status} task={activeTask} /> : null}</DragOverlay></DndContext>}</div>
    {isTaskOpen && <TaskDetailDrawer onClose={closeTask} projectId={projectId} taskId={taskId} />}
  </section>
}
