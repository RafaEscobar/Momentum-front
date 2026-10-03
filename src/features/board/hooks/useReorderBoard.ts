import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ApiError } from '@/api/errors'
import { boardKeys, projectKeys, taskKeys } from '@/api/queryKeys'
import type { BoardResponse } from '@/features/board/api/boardApi'
import { reorderTasks } from '@/features/tasks/api/tasksApi'
import type { ReorderTaskInput } from '@/features/tasks/api/tasksApi'
import type { TaskSummary } from '@/features/tasks/types'

interface ReorderBoardVariables {
  projectId: number
  sprintId?: number
  tasks: ReorderTaskInput[]
  previousBoard: BoardResponse
  nextBoard: BoardResponse
}

function mergeServerTasks(board: BoardResponse, tasks: TaskSummary[]): BoardResponse {
  const serverTasks = new Map(tasks.map((task) => [task.id, task]))
  const merge = (items: typeof board.todo) => items.map((task) => ({ ...task, ...serverTasks.get(task.id) }))
  return { ...board, todo: merge(board.todo), in_progress: merge(board.in_progress), blocked: merge(board.blocked), done: merge(board.done) }
}

export function useReorderBoard() {
  const queryClient = useQueryClient()

  return useMutation<TaskSummary[], ApiError, ReorderBoardVariables>({
    mutationFn: ({ projectId, tasks }) => reorderTasks(projectId, tasks),
    onMutate: async ({ projectId, sprintId, nextBoard }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(projectId, sprintId) })
      queryClient.setQueryData(boardKeys.detail(projectId, sprintId), nextBoard)
    },
    onSuccess: (tasks, { projectId, sprintId, nextBoard }) => {
      queryClient.setQueryData(boardKeys.detail(projectId, sprintId), mergeServerTasks(nextBoard, tasks))
      void queryClient.invalidateQueries({ queryKey: taskKeys.all(projectId) })
      void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) })
    },
    onError: (_, { projectId, sprintId, previousBoard }) => {
      queryClient.setQueryData(boardKeys.detail(projectId, sprintId), previousBoard)
      toast.error('No fue posible mover la tarea. Se restauró el Board.')
    },
    onSettled: (_, __, { projectId, sprintId }) => {
      void queryClient.invalidateQueries({
        queryKey: boardKeys.detail(projectId, sprintId),
        exact: true,
      })
    },
  })
}
