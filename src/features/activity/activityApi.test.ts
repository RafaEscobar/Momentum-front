import { http, HttpResponse } from 'msw'

import { getActivities } from '@/features/activity/api/activityApi'
import { server } from '@/test/server'

describe('activityApi', () => {
  it('sends the documented activity filters', async () => {
    server.use(http.get('*/api/projects/7/activities', ({ request }) => {
      const params = new URL(request.url).searchParams
      expect(params.get('page')).toBe('2')
      expect(params.get('type')).toBe('task_completed')
      expect(params.get('date_from')).toBe('2026-09-01')
      expect(params.get('date_to')).toBe('2026-09-25')
      return HttpResponse.json({ data: [], links: {}, meta: {} })
    }))

    await getActivities(7, {
      page: 2,
      type: 'task_completed',
      date_from: '2026-09-01',
      date_to: '2026-09-25',
    })
  })
})
