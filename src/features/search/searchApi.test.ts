import { http, HttpResponse } from 'msw'

import { globalSearch } from '@/features/search/api/searchApi'
import { server } from '@/test/server'

describe('searchApi', () => {
  it('sends the documented global search parameters', async () => {
    server.use(http.get('*/api/search', ({ request }) => {
      const params = new URL(request.url).searchParams
      expect(params.get('q')).toBe('chapter')
      expect(params.get('projects_page')).toBe('2')
      expect(params.get('tasks_page')).toBe('3')
      expect(params.get('notes_page')).toBe('4')
      return HttpResponse.json({
        projects: [{ id: 7, name: 'Chapters' }], tasks: [], notes: [],
        meta: {
          projects: { current_page: 2, last_page: 2, per_page: 10, total: 11 },
          tasks: { current_page: 3, last_page: 3, per_page: 10, total: 21 },
          notes: { current_page: 4, last_page: 4, per_page: 10, total: 31 },
        },
      })
    }))

    const result = await globalSearch({
      q: ' chapter ', projects_page: 2, tasks_page: 3, notes_page: 4,
    })

    expect(result.projects[0].name).toBe('Chapters')
  })
})
