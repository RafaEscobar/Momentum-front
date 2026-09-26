import { http, HttpResponse } from 'msw'

import { getBoard } from '@/features/board/api/boardApi'
import { server } from '@/test/server'

describe('board API', () => {
  it('uses the documented route and optional sprint filter', async () => {
    server.use(http.get('*/api/projects/7/board', ({ request }) => {
      expect(new URL(request.url).searchParams.get('sprint_id')).toBe('3')
      return HttpResponse.json({ sprint: null, backlog: [], todo: [], in_progress: [], blocked: [], done: [] })
    }))

    expect(await getBoard(7, 3)).toEqual({ sprint: null, backlog: [], todo: [], in_progress: [], blocked: [], done: [] })
  })
})
