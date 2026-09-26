import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as SprintsPage } from '@/pages/SprintsPage'
import type { CompleteSprintResponse } from '@/features/sprints/api/sprintsApi'
import { sprintCompletionMessage } from '@/features/sprints/utils/sprintCompletion'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const sprint = { id: 3, project_id: 7, name: 'Sprint 7', goal: 'Completar migración Chapters.', start_date: '2026-09-12', end_date: '2026-09-26', status: 'planned', planned_points: 25, completed_points: 18, progress_percentage: 72, completed_at: null, created_at: '', updated_at: '' }
const page = (data: unknown[]) => ({ data, links: { first: '', last: '', prev: null, next: null }, meta: { current_page: 1, from: data.length ? 1 : null, last_page: 1, per_page: 15, to: data.length, total: data.length } })

describe('Sprints page', () => {
  it('groups Sprint cards and exposes start and edit actions', async () => {
    let started = false
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', description: null, status: 'active', priority: 'high', color: null, icon: null, progress: 0, start_date: null, target_date: null, created_at: '', updated_at: '' } })),
      http.get('*/api/projects/7/sprints', ({ request }) => {
        const status = new URL(request.url).searchParams.get('status')
        return HttpResponse.json(page(status === 'planned' ? [sprint] : []))
      }),
      http.get('*/api/projects/7/sprints/3', () => HttpResponse.json({ data: sprint })),
      http.post('*/api/projects/7/sprints/3/start', () => { started = true; return HttpResponse.json({ data: { ...sprint, status: 'active' } }) }),
    )

    const { user } = renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints')

    expect(await screen.findByRole('heading', { name: 'Sprints planificados' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sprint activo' })).toBeInTheDocument()
    expect(await screen.findByText('Completar migración Chapters.')).toBeInTheDocument()
    expect(screen.getByText('18 / 25 Story Points')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
    expect(screen.getByText('Planificado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /editar/i })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: /iniciar/i }))
    await user.click(screen.getByRole('button', { name: 'Iniciar Sprint' }))
    await waitFor(() => expect(started).toBe(true))
  })

  it('validates dates and creates Sprints as planned', async () => {
    let payload: Record<string, unknown> | undefined
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', description: null, status: 'active', priority: 'high', color: null, icon: null, progress: 0, start_date: null, target_date: null, created_at: '', updated_at: '' } })),
      http.get('*/api/projects/7/sprints', () => HttpResponse.json(page([]))),
      http.post('*/api/projects/7/sprints', async ({ request }) => {
        payload = await request.json() as Record<string, unknown>
        return HttpResponse.json({ data: { ...sprint, ...payload, id: 9 } }, { status: 201 })
      }),
    )
    const { user } = renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints?create=sprint')

    await screen.findByRole('dialog', { name: 'Crear Sprint' })
    await user.type(screen.getByLabelText('Nombre'), 'Sprint nuevo')
    await user.type(screen.getByLabelText('Fecha inicial'), '2026-10-10')
    await user.type(screen.getByLabelText('Fecha final'), '2026-10-01')
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(await screen.findByText('La fecha final no puede ser anterior a la inicial.')).toBeInTheDocument()
    expect(payload).toBeUndefined()

    await user.clear(screen.getByLabelText('Fecha final'))
    await user.type(screen.getByLabelText('Fecha final'), '2026-10-20')
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    await waitFor(() => expect(payload).toMatchObject({ name: 'Sprint nuevo', status: 'planned', start_date: '2026-10-10', end_date: '2026-10-20' }))
  })

  it('shows Laravel validation errors when Sprint creation is rejected', async () => {
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', () => HttpResponse.json(page([]))),
      http.post('*/api/projects/7/sprints', () => HttpResponse.json({ message: 'Los datos no son válidos.', errors: { name: ['El nombre ya está en uso.'] } }, { status: 422 })),
    )
    const { user } = renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints?create=sprint')
    await user.type(await screen.findByLabelText('Nombre'), 'Sprint duplicado')
    await user.click(screen.getByRole('button', { name: /guardar/i }))
    expect(await screen.findByText('El nombre ya está en uso.')).toBeInTheDocument()
  })

  it('completes the active Sprint and moves unfinished tasks to Backlog', async () => {
    const activeSprint = { ...sprint, status: 'active' }
    let completePayload: unknown
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', ({ request }) => {
        const status = new URL(request.url).searchParams.get('status')
        return HttpResponse.json(page(status === 'active' ? [activeSprint] : []))
      }),
      http.get('*/api/projects/7/sprints/3', () => HttpResponse.json({ data: activeSprint })),
      http.get('*/api/projects/7/board', ({ request }) => {
        expect(new URL(request.url).searchParams.get('sprint_id')).toBe('3')
        return HttpResponse.json({
          sprint: activeSprint,
          backlog: [],
          todo: [{ id: 1 }],
          in_progress: [{ id: 2 }],
          blocked: [],
          done: [{ id: 3 }, { id: 4 }],
        })
      }),
      http.post('*/api/projects/7/sprints/3/complete', async ({ request }) => {
        completePayload = await request.json()
        return HttpResponse.json({
          sprint: { ...activeSprint, status: 'completed' },
          summary: { planned_points: 25, completed_points: 18, completed_tasks: 2, unfinished_tasks: 2 },
          moved_tasks: [{ id: 1 }, { id: 2 }],
        })
      }),
    )

    const { user } = renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints')

    await user.click(await screen.findByRole('button', { name: 'Completar Sprint' }))
    const dialog = screen.getByRole('dialog', { name: 'Completar Sprint' })
    expect(await within(dialog).findByText('25 pts')).toBeInTheDocument()
    expect(within(dialog).getByText('18 pts')).toBeInTheDocument()
    expect(within(dialog).getByText('Tareas completadas').nextElementSibling).toHaveTextContent('2')
    expect(within(dialog).getByText('Tareas pendientes').nextElementSibling).toHaveTextContent('2')
    expect(within(dialog).getByRole('radio', { name: /Mover al Backlog/ })).toBeChecked()
    expect(within(dialog).getByRole('radio', { name: /Mover al siguiente Sprint/ })).toBeDisabled()

    await user.click(within(dialog).getByRole('button', { name: 'Completar Sprint' }))
    await waitFor(() => expect(completePayload).toEqual({ unfinished_action: 'backlog' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Completar Sprint' })).not.toBeInTheDocument())
  })

  it('validates and sends the selected planned Sprint as destination', async () => {
    const activeSprint = { ...sprint, status: 'active' }
    const nextSprint = { ...sprint, id: 8, name: 'Sprint 8', status: 'planned', completed_points: 0 }
    let completePayload: unknown
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', ({ request }) => {
        const status = new URL(request.url).searchParams.get('status')
        return HttpResponse.json(page(status === 'active' ? [activeSprint] : status === 'planned' ? [nextSprint] : []))
      }),
      http.get('*/api/projects/7/sprints/:sprintId', ({ params }) => HttpResponse.json({ data: params.sprintId === '8' ? nextSprint : activeSprint })),
      http.get('*/api/projects/7/board', () => HttpResponse.json({
        sprint: activeSprint, backlog: [], todo: [{ id: 1 }], in_progress: [], blocked: [], done: [{ id: 2 }],
      })),
      http.post('*/api/projects/7/sprints/3/complete', async ({ request }) => {
        completePayload = await request.json()
        return HttpResponse.json({
          sprint: { ...activeSprint, status: 'completed' },
          summary: { planned_points: 25, completed_points: 18, completed_tasks: 1, unfinished_tasks: 1 },
          moved_tasks: [{ id: 1 }],
        })
      }),
    )

    const { user } = renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints')
    await user.click(await screen.findByRole('button', { name: 'Completar Sprint' }))
    const dialog = screen.getByRole('dialog', { name: 'Completar Sprint' })
    const nextOption = await within(dialog).findByRole('radio', { name: /Mover al siguiente Sprint/ })
    expect(nextOption).toBeEnabled()
    await user.click(nextOption)
    await user.click(within(dialog).getByRole('button', { name: 'Completar Sprint' }))
    expect(await within(dialog).findByText('Selecciona el Sprint de destino.')).toBeInTheDocument()
    expect(completePayload).toBeUndefined()

    await user.selectOptions(within(dialog).getByLabelText('Sprint destino'), '8')
    await user.click(within(dialog).getByRole('button', { name: 'Completar Sprint' }))
    await waitFor(() => expect(completePayload).toEqual({ unfinished_action: 'next_sprint', next_sprint_id: 8 }))
  })

  it('formats the completion result for the success toast', () => {
    const result = {
      sprint: { ...sprint, status: 'completed' },
      summary: { planned_points: 28, completed_points: 23, completed_tasks: 8, unfinished_tasks: 2 },
      moved_tasks: [{ id: 1 }, { id: 2 }],
    } as CompleteSprintResponse

    expect(sprintCompletionMessage(result, 'backlog')).toBe(
      '23 / 28 puntos completados · 2 tareas movidas al Backlog',
    )
  })

  it('renders completed Sprints as a lightweight history', async () => {
    const completedSprint = {
      ...sprint,
      id: 6,
      name: 'Sprint 6',
      status: 'completed',
      planned_points: 28,
      completed_points: 23,
      progress_percentage: 82,
      completed_at: '2026-09-20T18:00:00.000000Z',
    }
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', ({ request }) => {
        const status = new URL(request.url).searchParams.get('status')
        return HttpResponse.json(page(status === 'completed' ? [completedSprint] : []))
      }),
    )

    renderWithProviders(<Routes><Route element={<SprintsPage />} path="/projects/:projectId/sprints" /></Routes>, '/projects/7/sprints')

    expect(await screen.findByRole('heading', { name: 'Sprint 6' })).toBeInTheDocument()
    expect(screen.getByText('23 / 28 Story Points')).toBeInTheDocument()
    expect(screen.getByText('82%')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })
})
