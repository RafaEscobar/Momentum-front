import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as ActivityPage } from '@/pages/ActivityPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const activity = {
  id: 30,
  project_id: 7,
  type: 'task_status_changed',
  description: 'Estado de Documentar API: todo -> in_progress',
  metadata: { from: 'todo', to: 'in_progress' },
  subject: { id: 10, type: 'task', label: 'Documentar API' },
  created_at: '2026-09-24T18:30:00.000000Z',
}

function page(data: unknown[], currentPage = 1, lastPage = 1) {
  return {
    data,
    links: { first: '', last: '', prev: null, next: null },
    meta: {
      current_page: currentPage,
      from: data.length ? 1 : null,
      last_page: lastPage,
      per_page: 15,
      to: data.length,
      total: data.length,
    },
  }
}

describe('Activity page', () => {
  it('persists filters, renders resource links and paginates', async () => {
    const requestedPages: string[] = []
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: {
        id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0,
      } })),
      http.get('*/api/projects/7/activities', ({ request }) => {
        const params = new URL(request.url).searchParams
        expect(params.get('type')).toBe('task_status_changed')
        expect(params.get('date_from')).toBe('2026-09-01')
        expect(params.get('date_to')).toBe('2026-09-25')
        const currentPage = params.get('page') ?? '1'
        requestedPages.push(currentPage)
        return HttpResponse.json(page([activity], Number(currentPage), 2))
      }),
    )

    const { user } = renderWithProviders(
      <Routes><Route element={<ActivityPage />} path="/projects/:projectId/activity" /></Routes>,
      '/projects/7/activity?type=task_status_changed&date_from=2026-09-01&date_to=2026-09-25',
    )

    expect(await screen.findByText(activity.description)).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo')).toHaveValue('task_status_changed')
    expect(screen.getByLabelText('Desde')).toHaveValue('2026-09-01')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-09-25')
    expect(screen.getByRole('link', { name: /Estado de Documentar API/ })).toHaveAttribute(
      'href',
      '/projects/7/board?task=10&action=edit',
    )
    expect(screen.getByText('Estado actualizado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }))
    await waitFor(() => expect(requestedPages).toContain('2'))
    expect(await screen.findByText('Página 2 de 2')).toBeInTheDocument()
  })

  it('shows an empty state when no events match', async () => {
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum' } })),
      http.get('*/api/projects/7/activities', () => HttpResponse.json(page([]))),
    )

    renderWithProviders(
      <Routes><Route element={<ActivityPage />} path="/projects/:projectId/activity" /></Routes>,
      '/projects/7/activity',
    )

    expect(await screen.findByText('Sin actividad')).toBeInTheDocument()
  })
})
