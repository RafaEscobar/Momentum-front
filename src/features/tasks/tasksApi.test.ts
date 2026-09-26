import { http, HttpResponse } from 'msw'

import { changeTaskStatus, createTask, deleteTask, getTask, getTasks, updateTask } from '@/features/tasks/api/tasksApi'
import type { CreateTaskPayload, Task, UpdateTaskPayload } from '@/features/tasks/types'
import { server } from '@/test/server'

const task: Task = {
  id: 10,
  project_id: 7,
  sprint_id: 3,
  title: 'Documentar API',
  description: 'Revisar los contratos HTTP.',
  type: 'task',
  priority: 'high',
  status: 'in_progress',
  story_points: 3,
  position: 2,
  completed_at: null,
  created_at: '2026-09-24T18:30:00.000000Z',
  updated_at: '2026-09-24T18:30:00.000000Z',
  tags: [],
}

describe('tasks API', () => {
  it('lists tasks using the documented nested route and filters', async () => {
    server.use(
      http.get('*/api/projects/7/tasks', ({ request }) => {
        const url = new URL(request.url)

        expect(url.searchParams.get('page')).toBe('2')
        expect(url.searchParams.get('status')).toBe('in_progress')
        expect(url.searchParams.get('priority')).toBe('high')
        expect(url.searchParams.get('type')).toBe('task')
        expect(url.searchParams.get('sprint_id')).toBe('3')
        expect(url.searchParams.get('tag_id')).toBe('4')
        expect(url.searchParams.get('search')).toBe('Documentar')

        return HttpResponse.json({
          data: [task],
          links: { first: '/page=1', last: '/page=2', prev: '/page=1', next: null },
          meta: { current_page: 2, from: 16, last_page: 2, per_page: 15, to: 16, total: 16 },
        })
      }),
    )

    const response = await getTasks(7, {
      page: 2,
      status: 'in_progress',
      priority: 'high',
      type: 'task',
      sprint_id: 3,
      tag_id: 4,
      search: ' Documentar ',
    })

    expect(response.data).toEqual([task])
    expect(response.meta.total).toBe(16)
  })

  it('uses the documented routes and resource wrapper for task CRUD', async () => {
    let createPayload: CreateTaskPayload | undefined
    let updatePayload: UpdateTaskPayload | undefined
    let deleted = false

    server.use(
      http.get('*/api/projects/7/tasks/10', () => HttpResponse.json({ data: task })),
      http.post('*/api/projects/7/tasks', async ({ request }) => {
        createPayload = (await request.json()) as CreateTaskPayload
        return HttpResponse.json({ data: { ...task, ...createPayload } }, { status: 201 })
      }),
      http.patch('*/api/projects/7/tasks/10', async ({ request }) => {
        updatePayload = (await request.json()) as UpdateTaskPayload
        return HttpResponse.json({ data: { ...task, ...updatePayload } })
      }),
      http.delete('*/api/projects/7/tasks/10', () => {
        deleted = true
        return new HttpResponse(null, { status: 204 })
      }),
    )

    expect(await getTask(7, 10)).toEqual(task)
    expect(await createTask(7, { title: 'Nueva tarea', story_points: null })).toMatchObject({
      title: 'Nueva tarea',
      story_points: null,
    })
    expect(createPayload).toEqual({ title: 'Nueva tarea', story_points: null })

    expect(await updateTask(7, 10, { status: 'done' })).toMatchObject({ status: 'done' })
    expect(updatePayload).toEqual({ status: 'done' })

    await deleteTask(7, 10)
    expect(deleted).toBe(true)
  })

  it('changes status through the dedicated endpoint', async () => {
    let payload: unknown
    server.use(http.patch('*/api/projects/7/tasks/10/status', async ({ request }) => {
      payload = await request.json()
      return HttpResponse.json({ data: { ...task, status: 'blocked' } })
    }))
    expect(await changeTaskStatus(7, 10, 'blocked')).toMatchObject({ status: 'blocked' })
    expect(payload).toEqual({ status: 'blocked' })
  })
})
