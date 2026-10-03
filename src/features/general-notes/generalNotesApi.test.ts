import { http, HttpResponse } from 'msw'

import {
  createGeneralNote,
  deleteGeneralNote,
  getGeneralNote,
  getGeneralNotes,
  updateGeneralNote,
} from '@/features/general-notes/api/generalNotesApi'
import { server } from '@/test/server'

describe('general notes API', () => {
  it('uses every endpoint and the documented response wrappers', async () => {
    const requests: string[] = []
    server.use(
      http.get('*/api/notes', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('2')
        expect(url.searchParams.get('search')).toBe('ideas')
        requests.push('list')
        return HttpResponse.json({ data: [{ id: 4, title: 'Ideas', created_at: null, updated_at: null }], links: {}, meta: {} })
      }),
      http.get('*/api/notes/4', () => {
        requests.push('detail')
        return HttpResponse.json({ data: { id: 4, title: 'Ideas', content: '# Ideas', created_at: null, updated_at: null } })
      }),
      http.post('*/api/notes', async ({ request }) => {
        expect(await request.json()).toEqual({ title: 'Nueva', content: 'Contenido' })
        requests.push('create')
        return HttpResponse.json({ data: { id: 5, title: 'Nueva', content: 'Contenido', created_at: null, updated_at: null } }, { status: 201 })
      }),
      http.patch('*/api/notes/4', async ({ request }) => {
        expect(await request.json()).toEqual({ title: 'Revisada' })
        requests.push('update')
        return HttpResponse.json({ data: { id: 4, title: 'Revisada', content: '# Ideas', created_at: null, updated_at: null } })
      }),
      http.delete('*/api/notes/4', () => {
        requests.push('delete')
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await getGeneralNotes({ page: 2, search: ' ideas ' })
    await getGeneralNote(4)
    await createGeneralNote({ title: 'Nueva', content: 'Contenido' })
    await updateGeneralNote(4, { title: 'Revisada' })
    await deleteGeneralNote(4)

    expect(requests).toEqual(['list', 'detail', 'create', 'update', 'delete'])
  })
})
