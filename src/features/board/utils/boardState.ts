import { arrayMove } from '@dnd-kit/sortable'

import type { BoardResponse } from '@/features/board/api/boardApi'
import type { TaskStatus } from '@/features/tasks/types'

export type BoardStatus = Exclude<TaskStatus, 'backlog'>

const boardStatuses: BoardStatus[] = ['todo', 'in_progress', 'blocked', 'done']

function findTask(board: BoardResponse, taskId: number) {
  for (const status of boardStatuses) {
    const task = board[status].find((item) => item.id === taskId)
    if (task) return { task, status }
  }
}

export function moveTask(board: BoardResponse, taskId: number, targetStatus: BoardStatus, overId: number | string) {
  const source = findTask(board, taskId)
  if (!source) return null
  const sourceItems = [...board[source.status]]
  const sourceIndex = sourceItems.findIndex((task) => task.id === taskId)
  const overIndex = board[targetStatus].findIndex((task) => task.id === Number(overId))

  if (source.status === targetStatus) {
    const targetIndex = overIndex >= 0 ? overIndex : sourceItems.length - 1
    if (sourceIndex === targetIndex) return null
    const reordered = arrayMove(sourceItems, sourceIndex, targetIndex).map((task, position) => ({ ...task, status: targetStatus, position }))
    return { board: { ...board, [targetStatus]: reordered }, changedStatuses: [targetStatus] }
  }

  sourceItems.splice(sourceIndex, 1)
  const targetItems = [...board[targetStatus]]
  targetItems.splice(overIndex >= 0 ? overIndex : targetItems.length, 0, { ...source.task, status: targetStatus })
  const normalizedSource = sourceItems.map((task, position) => ({ ...task, status: source.status, position }))
  const normalizedTarget = targetItems.map((task, position) => ({ ...task, status: targetStatus, position }))
  return { board: { ...board, [source.status]: normalizedSource, [targetStatus]: normalizedTarget }, changedStatuses: [source.status, targetStatus] }
}

export function findBoardTask(board: BoardResponse, taskId: number) {
  return findTask(board, taskId)
}
