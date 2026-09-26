import { http, HttpResponse } from 'msw'

import { createTag, deleteTag, getTags, syncTaskTags, updateTag } from '@/features/tags/api/tagsApi'
import type { Tag } from '@/features/tasks/types'
import { server } from '@/test/server'

const tag: Tag = { id: 4, name: 'backend', color: '#22C55E', created_at: '', updated_at: '' }

describe('tags API', () => {
  it('supports tag CRUD and task synchronization using documented routes', async () => {
    const bodies: unknown[] = []
    let deleted = false
    server.use(
      http.get('*/api/tags', () => HttpResponse.json({ data: [tag] })),
      http.post('*/api/tags', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ data: tag }, { status: 201 }) }),
      http.patch('*/api/tags/4', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ data: { ...tag, name: 'api' } }) }),
      http.delete('*/api/tags/4', () => { deleted = true; return new HttpResponse(null, { status: 204 }) }),
      http.put('*/api/tasks/10/tags', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ data: [tag] }) }),
    )

    expect(await getTags()).toEqual([tag])
    await createTag({ name: 'backend', color: '#22C55E' })
    expect(await updateTag(4, { name: 'api', color: '#22C55E' })).toMatchObject({ name: 'api' })
    await syncTaskTags(10, [4])
    await deleteTag(4)

    expect(bodies).toEqual([{ name: 'backend', color: '#22C55E' }, { name: 'api', color: '#22C55E' }, { tag_ids: [4] }])
    expect(deleted).toBe(true)
  })
})
