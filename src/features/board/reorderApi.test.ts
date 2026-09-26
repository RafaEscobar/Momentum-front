import { http, HttpResponse } from 'msw'

import { reorderTasks } from '@/features/tasks/api/tasksApi'
import { server } from '@/test/server'

describe('task reorder API', () => {
  it('sends status and position to the documented endpoint', async () => {
    let body: unknown
    server.use(http.patch('*/api/projects/7/tasks/reorder', async ({ request }) => {
      body = await request.json()
      return HttpResponse.json({ data: [{ id: 10, project_id: 7, sprint_id: 3, title: 'Task', type: 'task', priority: 'medium', status: 'in_progress', story_points: 3, position: 0, completed_at: null, created_at: '', updated_at: '' }] })
    }))
    const tasks = [{ id: 10, status: 'in_progress' as const, position: 0 }]
    expect(await reorderTasks(7, tasks)).toHaveLength(1)
    expect(body).toEqual({ tasks })
  })
})
