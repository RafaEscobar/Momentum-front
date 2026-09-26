import { http, HttpResponse } from 'msw'

import { getDashboard } from '@/features/dashboard/api/dashboardApi'
import { server } from '@/test/server'

describe('dashboardApi', () => {
  it('loads the dashboard contract without expecting a data wrapper', async () => {
    server.use(
      http.get('*/api/dashboard', () => HttpResponse.json({
        projects: [{ id: 7, name: 'Momentum' }],
        active_sprints: [],
        summary: {
          active_projects: 1,
          planned_story_points: 21,
          completed_story_points: 8,
          pending_tasks: 3,
          in_progress_tasks: 2,
          completed_tasks: 5,
        },
        recent_activity: [],
      })),
    )

    const dashboard = await getDashboard()

    expect(dashboard.projects).toEqual([{ id: 7, name: 'Momentum' }])
    expect(dashboard.summary.completed_story_points).toBe(8)
  })
})
