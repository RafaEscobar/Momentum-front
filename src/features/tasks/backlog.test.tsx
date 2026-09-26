import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as BacklogPage } from '@/pages/BacklogPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

describe('backlog page', () => {
  it('renders ordered task information and addressable actions', async () => {
    server.use(
      http.get('*/api/projects/7', () =>
        HttpResponse.json({
          data: {
            id: 7,
            name: 'Momentum',
            description: null,
            status: 'active',
            priority: 'high',
            color: '#059669',
            icon: null,
            progress: 0,
            start_date: null,
            target_date: null,
            created_at: '2026-09-24T18:30:00.000000Z',
            updated_at: '2026-09-24T18:30:00.000000Z',
          },
        }),
      ),
      http.get('*/api/projects/7/backlog', () =>
        HttpResponse.json({
          data: [
            {
              id: 10,
              project_id: 7,
              sprint_id: null,
              title: 'Documentar API',
              type: 'task',
              priority: 'high',
              status: 'backlog',
              story_points: 3,
              position: 0,
              completed_at: null,
              created_at: '2026-09-24T18:30:00.000000Z',
              updated_at: '2026-09-24T18:30:00.000000Z',
              tags: [
                {
                  id: 4,
                  name: 'backend',
                  color: '#22C55E',
                  created_at: '2026-09-24T18:30:00.000000Z',
                  updated_at: '2026-09-24T18:30:00.000000Z',
                },
              ],
            },
          ],
          links: { first: '/page=1', last: '/page=1', prev: null, next: null },
          meta: {
            current_page: 1,
            from: 1,
            last_page: 1,
            per_page: 15,
            to: 1,
            total: 1,
            story_points_total: 3,
          },
        }),
      ),
      http.get('*/api/tags', () => HttpResponse.json({ data: [] })),
    )

    renderWithProviders(
      <Routes>
        <Route element={<BacklogPage />} path="/projects/:projectId/backlog" />
      </Routes>,
      '/projects/7/backlog',
    )

    expect(await screen.findByRole('heading', { name: 'Documentar API' })).toBeInTheDocument()
    expect(screen.getByText('Alta', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Tarea', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('3 pts')).toBeInTheDocument()
    expect(screen.getByText('backend')).toBeInTheDocument()
    expect(screen.getByText('1 tarea · 3 puntos')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar tarea Documentar API' })).toHaveAttribute(
      'href',
      '/projects/7/backlog?task=10&action=edit',
    )
    expect(screen.getByRole('link', { name: 'Asignar Documentar API a un Sprint' })).toHaveAttribute(
      'href',
      '/projects/7/backlog?task=10&action=assign-sprint',
    )
  })

  it('persists filters in the URL and debounces search requests', async () => {
    const requests: URL[] = []
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', description: null, status: 'active', priority: 'high', color: null, icon: null, progress: 0, start_date: null, target_date: null, created_at: '', updated_at: '' } })),
      http.get('*/api/tags', () => HttpResponse.json({ data: [{ id: 4, name: 'backend', color: '#22C55E', created_at: '', updated_at: '' }] })),
      http.get('*/api/projects/7/backlog', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json({ data: [], links: { first: '', last: '', prev: null, next: null }, meta: { current_page: 1, from: null, last_page: 1, per_page: 15, to: null, total: 0, story_points_total: 0 } })
      }),
    )

    const { user } = renderWithProviders(
      <Routes><Route element={<BacklogPage />} path="/projects/:projectId/backlog" /></Routes>,
      '/projects/7/backlog',
    )

    await user.selectOptions(await screen.findByLabelText('Filtrar por prioridad'), 'high')
    await user.selectOptions(screen.getByLabelText('Filtrar por tipo'), 'bug')
    await user.selectOptions(await screen.findByLabelText('Filtrar por etiqueta'), '4')
    await user.type(screen.getByLabelText('Buscar en backlog'), 'API')

    await waitFor(() => expect(requests.some((request) => request.searchParams.get('search') === 'API')).toBe(true))

    const lastRequest = requests.at(-1)
    expect(lastRequest?.searchParams.get('priority')).toBe('high')
    expect(lastRequest?.searchParams.get('type')).toBe('bug')
    expect(lastRequest?.searchParams.get('search')).toBe('API')
    expect(lastRequest?.searchParams.getAll('tag_ids[]')).toEqual(['4'])
    expect(screen.getAllByRole('link', { name: 'Crear tarea' })[0]).toHaveAttribute('href', expect.stringContaining('search=API'))

    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(screen.getByLabelText('Buscar en backlog')).toHaveValue('')
  })
})
