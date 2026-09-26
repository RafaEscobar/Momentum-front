import { http, HttpResponse } from 'msw'

import { createNote, deleteNote, getNote, getNotes, updateNote } from '@/features/notes/api/notesApi'
import { server } from '@/test/server'

describe('notesApi', () => {
  it('uses the documented notes endpoints and resource wrappers', async () => {
    const requests: string[] = []
    server.use(
      http.get('*/api/projects/7/notes', ({ request }) => {
        expect(new URL(request.url).searchParams.get('page')).toBe('2')
        requests.push('list')
        return HttpResponse.json({ data: [{ id: 4, project_id: 7, title: 'API' }], links: {}, meta: {} })
      }),
      http.get('*/api/projects/7/notes/4', () => {
        requests.push('detail')
        return HttpResponse.json({ data: { id: 4, project_id: 7, title: 'API', content: '# API' } })
      }),
      http.post('*/api/projects/7/notes', async ({ request }) => {
        expect(await request.json()).toEqual({ title: 'Nueva', content: 'Contenido' })
        requests.push('create')
        return HttpResponse.json({ data: { id: 5, project_id: 7, title: 'Nueva', content: 'Contenido' } }, { status: 201 })
      }),
      http.patch('*/api/projects/7/notes/4', async ({ request }) => {
        expect(await request.json()).toEqual({ title: 'Actualizada' })
        requests.push('update')
        return HttpResponse.json({ data: { id: 4, project_id: 7, title: 'Actualizada', content: '# API' } })
      }),
      http.delete('*/api/projects/7/notes/4', () => {
        requests.push('delete')
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await getNotes(7, 2)
    await getNote(7, 4)
    await createNote(7, { title: 'Nueva', content: 'Contenido' })
    await updateNote(7, 4, { title: 'Actualizada' })
    await deleteNote(7, 4)

    expect(requests).toEqual(['list', 'detail', 'create', 'update', 'delete'])
  })
})
