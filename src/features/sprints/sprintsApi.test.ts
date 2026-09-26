import { http, HttpResponse } from 'msw'

import { completeSprint, createSprint, deleteSprint, getSprint, getSprints, startSprint, updateSprint } from '@/features/sprints/api/sprintsApi'
import type { Sprint } from '@/features/sprints/types'
import { server } from '@/test/server'

const sprint: Sprint = { id: 3, project_id: 7, name: 'Sprint 1', goal: 'Publicar MVP', start_date: '2026-09-21', end_date: '2026-10-02', status: 'planned', planned_points: 21, completed_points: 8, progress_percentage: 38.1, completed_at: null, created_at: '', updated_at: '' }

describe('sprints API', () => {
  it('uses every documented Sprint endpoint', async () => {
    const bodies: unknown[] = []
    let deleted = false
    let started = false
    let completePayload: unknown
    server.use(
      http.get('*/api/projects/7/sprints', ({ request }) => {
        expect(new URL(request.url).searchParams.get('status')).toBe('planned')
        return HttpResponse.json({ data: [sprint], links: {}, meta: {} })
      }),
      http.get('*/api/projects/7/sprints/3', () => HttpResponse.json({ data: sprint })),
      http.post('*/api/projects/7/sprints', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ data: sprint }, { status: 201 }) }),
      http.patch('*/api/projects/7/sprints/3', async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ data: { ...sprint, name: 'Sprint editado' } }) }),
      http.delete('*/api/projects/7/sprints/3', () => { deleted = true; return new HttpResponse(null, { status: 204 }) }),
      http.post('*/api/projects/7/sprints/3/start', () => { started = true; return HttpResponse.json({ data: { ...sprint, status: 'active' } }) }),
      http.post('*/api/projects/7/sprints/3/complete', async ({ request }) => {
        completePayload = await request.json()
        return HttpResponse.json({
          sprint: { ...sprint, status: 'completed' },
          summary: { planned_points: 21, completed_points: 8, completed_tasks: 3, unfinished_tasks: 2 },
          moved_tasks: [],
        })
      }),
    )

    expect((await getSprints(7, { status: 'planned' })).data).toEqual([sprint])
    expect(await getSprint(7, 3)).toEqual(sprint)
    await createSprint(7, { name: 'Sprint 1', status: 'planned' })
    await updateSprint(7, 3, { name: 'Sprint editado' })
    await startSprint(7, 3)
    const completion = await completeSprint(7, 3, { unfinished_action: 'backlog' })
    await deleteSprint(7, 3)

    expect(bodies).toEqual([{ name: 'Sprint 1', status: 'planned' }, { name: 'Sprint editado' }])
    expect(started).toBe(true)
    expect(completePayload).toEqual({ unfinished_action: 'backlog' })
    expect(completion.summary.unfinished_tasks).toBe(2)
    expect(deleted).toBe(true)
  })
})
