import { delay, http, HttpResponse } from 'msw'

import { getBacklog } from '@/features/tasks/api/backlogApi'
import { server } from '@/test/server'

describe('backlog API', () => {
  it('forwards AbortSignal so stale searches can be cancelled', async () => {
    server.use(http.get('*/api/projects/7/backlog', async () => {
      await delay(1_000)
      return HttpResponse.json({ data: [], links: {}, meta: {} })
    }))
    const controller = new AbortController()
    const request = getBacklog(7, { search: 'old' }, { signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toMatchObject({ code: 'ERR_CANCELED' })
  })
})
