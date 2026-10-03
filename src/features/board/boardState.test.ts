import type { BoardResponse } from '@/features/board/api/boardApi'
import type { BoardTask, TaskStatus } from '@/features/tasks/types'
import { moveTask } from '@/features/board/utils/boardState'

function task(id: number, status: TaskStatus, position: number): BoardTask {
  return { id, project_id: 7, sprint_id: 3, title: `Task ${id}`, type: 'task', priority: 'medium', status, story_points: 3, position, completed_at: null, created_at: '', updated_at: '', tags: [], checklist: { total: 0, completed: 0 } }
}

const board: BoardResponse = { sprint: null, backlog: [], todo: [task(1, 'todo', 0), task(2, 'todo', 1)], in_progress: [task(3, 'in_progress', 0)], blocked: [], done: [] }

describe('Board movement', () => {
  it('updates positions when sorting inside a column', () => {
    const result = moveTask(board, 2, 'todo', 1)
    expect(result?.board.todo.map(({ id, position }) => ({ id, position }))).toEqual([{ id: 2, position: 0 }, { id: 1, position: 1 }])
  })

  it('updates status and positions when moving between columns', () => {
    const result = moveTask(board, 1, 'in_progress', 3)
    expect(result?.board.todo).toMatchObject([{ id: 2, status: 'todo', position: 0 }])
    expect(result?.board.in_progress).toMatchObject([{ id: 1, status: 'in_progress', position: 0 }, { id: 3, status: 'in_progress', position: 1 }])
  })

  it('moves a task into an empty column when dropping on its background', () => {
    const result = moveTask(board, 1, 'blocked', 'column-blocked')

    expect(result?.board.todo.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: 2, position: 0 },
    ])
    expect(result?.board.blocked).toMatchObject([
      { id: 1, status: 'blocked', position: 0 },
    ])
  })

  it('moves a task to the end when dropping on its current column background', () => {
    const result = moveTask(board, 1, 'todo', 'column-todo')

    expect(result?.board.todo.map(({ id, position }) => ({ id, position }))).toEqual([
      { id: 2, position: 0 },
      { id: 1, position: 1 },
    ])
  })
})
