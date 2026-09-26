import { screen, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'

import { boardKeys } from '@/api/queryKeys'
import type { BoardResponse } from '@/features/board/api/boardApi'
import { useReorderBoard } from '@/features/board/hooks/useReorderBoard'
import type { BoardTask } from '@/features/tasks/types'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'
import { toast } from 'sonner'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

const task: BoardTask = { id: 10, project_id: 7, sprint_id: 3, title: 'Task', type: 'task', priority: 'medium', status: 'todo', story_points: 3, position: 0, completed_at: null, created_at: '', updated_at: '', tags: [], checklist: { total: 0, completed: 0 } }
const previousBoard: BoardResponse = { sprint: null, backlog: [], todo: [task], in_progress: [], blocked: [], done: [] }
const nextBoard: BoardResponse = { ...previousBoard, todo: [], in_progress: [{ ...task, status: 'in_progress' }] }

function ReorderHarness() {
  const mutation = useReorderBoard()
  return <button onClick={() => mutation.mutate({ projectId: 7, tasks: [{ id: 10, status: 'in_progress', position: 0 }], previousBoard, nextBoard })} type="button">Mover</button>
}

describe('optimistic Board reorder', () => {
  it('restores the previous Board when the API rejects the move', async () => {
    server.use(http.patch('*/api/projects/7/tasks/reorder', async () => {
      await delay(100)
      return HttpResponse.json({ message: 'Movimiento inválido.' }, { status: 422 })
    }))
    const { user, queryClient } = renderWithProviders(<ReorderHarness />)
    queryClient.setQueryData(boardKeys.detail(7), previousBoard)

    await user.click(screen.getByRole('button', { name: 'Mover' }))
    await waitFor(() => expect(queryClient.getQueryData<BoardResponse>(boardKeys.detail(7))?.in_progress).toHaveLength(1))
    await waitFor(() => expect(queryClient.getQueryData<BoardResponse>(boardKeys.detail(7))?.todo).toHaveLength(1))
    expect(queryClient.getQueryData<BoardResponse>(boardKeys.detail(7))?.in_progress).toHaveLength(0)
    expect(toast.error).toHaveBeenCalledWith('No fue posible mover la tarea. Se restauró el Board.')
  })
})
