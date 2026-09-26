import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as SprintsPage } from '@/pages/SprintsPage'
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
})
