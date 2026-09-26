import { http, HttpResponse } from 'msw'

import { createChecklistItem, deleteChecklistItem, updateChecklistItem } from '@/features/tasks/api/checklistApi'
import type { ChecklistItem } from '@/features/tasks/types'
import { server } from '@/test/server'

const item: ChecklistItem = { id: 20, task_id: 10, title: 'Controller', is_completed: false, position: 2, created_at: '', updated_at: '' }

describe('checklist API', () => {
  it('uses the documented create, update and delete routes', async () => {
    let createBody: unknown
    let updateBody: unknown
    let deleted = false
    server.use(
      http.post('*/api/tasks/10/checklist', async ({ request }) => { createBody = await request.json(); return HttpResponse.json({ data: item }, { status: 201 }) }),
      http.patch('*/api/tasks/10/checklist/20', async ({ request }) => { updateBody = await request.json(); return HttpResponse.json({ data: { ...item, is_completed: true } }) }),
      http.delete('*/api/tasks/10/checklist/20', () => { deleted = true; return new HttpResponse(null, { status: 204 }) }),
    )

    expect(await createChecklistItem(10, { title: 'Controller', position: 2 })).toEqual(item)
    expect(createBody).toEqual({ title: 'Controller', position: 2 })
    expect(await updateChecklistItem(10, 20, { is_completed: true })).toMatchObject({ is_completed: true })
    expect(updateBody).toEqual({ is_completed: true })
    await deleteChecklistItem(10, 20)
    expect(deleted).toBe(true)
  })
})
