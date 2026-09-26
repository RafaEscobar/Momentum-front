import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as TasksPage } from '@/pages/TasksPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const page = { data: [], links: { first: '', last: '', prev: null, next: null }, meta: { current_page: 1, from: null, last_page: 1, per_page: 15, to: null, total: 0 } }

describe('Tasks page filters', () => {
  it('combines all filters, persists them in the URL and clears them', async () => {
    const requests: URL[] = []
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', () => HttpResponse.json({ ...page, data: [{ id: 3, project_id: 7, name: 'Sprint 3', status: 'active' }] })),
      http.get('*/api/tags', () => HttpResponse.json({ data: [{ id: 4, name: 'backend', color: '#22C55E' }] })),
      http.get('*/api/projects/7/tasks', ({ request }) => {
        requests.push(new URL(request.url))
        return HttpResponse.json(page)
      }),
    )

    const { user } = renderWithProviders(
      <Routes><Route element={<TasksPage />} path="/projects/:projectId/tasks" /></Routes>,
      '/projects/7/tasks?status=todo&priority=high&type=bug&sprint=3&tag=4',
    )

    expect(await screen.findByLabelText('Filtrar por estado')).toHaveValue('todo')
    expect(screen.getByLabelText('Filtrar por prioridad')).toHaveValue('high')
    expect(screen.getByLabelText('Filtrar por tipo')).toHaveValue('bug')
    expect(await screen.findByLabelText('Filtrar por Sprint')).toHaveValue('3')
    expect(await screen.findByLabelText('Filtrar por etiqueta')).toHaveValue('4')
    await user.type(screen.getByLabelText('Buscar tareas'), 'chapter')

    await waitFor(() => expect(requests.some((request) => request.searchParams.get('search') === 'chapter')).toBe(true))
    const filteredRequest = requests.at(-1)
    expect(filteredRequest?.searchParams.get('status')).toBe('todo')
    expect(filteredRequest?.searchParams.get('priority')).toBe('high')
    expect(filteredRequest?.searchParams.get('type')).toBe('bug')
    expect(filteredRequest?.searchParams.get('sprint_id')).toBe('3')
    expect(filteredRequest?.searchParams.get('tag_id')).toBe('4')

    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(screen.getByLabelText('Buscar tareas')).toHaveValue('')
    await waitFor(() => {
      const latest = requests.at(-1)
      expect(latest?.searchParams.get('status')).toBeNull()
      expect(latest?.searchParams.get('sprint_id')).toBeNull()
    })
  })
})
