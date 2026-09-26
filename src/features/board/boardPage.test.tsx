import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as BoardPage } from '@/pages/BoardPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const task = { id: 10, project_id: 7, sprint_id: 3, title: 'Documentar API', type: 'task', priority: 'high', status: 'todo', story_points: 3, position: 0, completed_at: null, created_at: '', updated_at: '', tags: [{ id: 4, name: 'backend', color: '#22C55E', created_at: '', updated_at: '' }], checklist: { total: 2, completed: 1 } }

describe('Board page', () => {
  it('renders the active Sprint in four columns with aggregate counts and points', async () => {
    let changedStatus: string | undefined
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/board', () => HttpResponse.json({
        sprint: { id: 3, project_id: 7, name: 'Sprint 7', start_date: null, end_date: null, status: 'active', planned_points: 3, completed_points: 0, progress_percentage: 0, completed_at: null },
        backlog: [{ ...task, sprint_id: null, status: 'backlog' }],
        todo: [task],
        in_progress: [],
        blocked: [],
        done: [],
      })),
      http.get('*/api/projects/7/sprints', () => HttpResponse.json({ data: [], links: {}, meta: {} })),
      http.patch('*/api/projects/7/tasks/10/status', async ({ request }) => {
        changedStatus = ((await request.json()) as { status: string }).status
        return HttpResponse.json({ data: { ...task, status: changedStatus } })
      }),
    )

    const { user } = renderWithProviders(<Routes><Route element={<BoardPage />} path="/projects/:projectId/board" /></Routes>, '/projects/7/board')

    expect(await screen.findByText('Sprint 7')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Por hacer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'En progreso' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bloqueadas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Terminadas' })).toBeInTheDocument()
    expect(screen.getByText('Documentar API')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Tarea')).toBeInTheDocument()
    expect(screen.getByText('backend')).toBeInTheDocument()
    expect(screen.getByText('1/2 checklist')).toBeInTheDocument()
    expect(screen.getByText('1 tarea')).toBeInTheDocument()
    expect(screen.getAllByText('3 pts')).toHaveLength(2)
    expect(screen.getByRole('link', { name: '1 en Backlog' })).toHaveAttribute('href', '/projects/7/backlog')
    expect(screen.getByText('0 / 3 Story Points')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()

    const statusSelect = screen.getByRole('combobox', { name: 'Cambiar estado de Documentar API' })
    expect(Array.from((statusSelect as HTMLSelectElement).options).map((option) => option.value)).toEqual(['todo', 'in_progress', 'blocked', 'done'])
    await user.selectOptions(statusSelect, 'blocked')
    await waitFor(() => expect(changedStatus).toBe('blocked'))
  })

  it('shows an actionable empty state without an active Sprint', async () => {
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/board', () => HttpResponse.json({ sprint: null, backlog: [], todo: [], in_progress: [], blocked: [], done: [] })),
      http.get('*/api/projects/7/sprints', () => HttpResponse.json({ data: [], links: {}, meta: {} })),
    )
    renderWithProviders(<Routes><Route element={<BoardPage />} path="/projects/:projectId/board" /></Routes>, '/projects/7/board')
    expect(await screen.findByRole('heading', { name: 'No hay un Sprint activo' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver Sprints' })).toHaveAttribute('href', '/projects/7/sprints')
  })

  it('loads a selected completed Sprint from the URL in read-only mode', async () => {
    const completedSprint = { id: 9, project_id: 7, name: 'Sprint histórico', start_date: null, end_date: null, status: 'completed', planned_points: 3, completed_points: 3, progress_percentage: 100, completed_at: '2026-09-20' }
    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', status: 'active', priority: 'high', progress: 0 } })),
      http.get('*/api/projects/7/sprints', ({ request }) => HttpResponse.json({ data: new URL(request.url).searchParams.get('status') === 'completed' ? [completedSprint] : [], links: {}, meta: {} })),
      http.get('*/api/projects/7/board', ({ request }) => {
        expect(new URL(request.url).searchParams.get('sprint_id')).toBe('9')
        return HttpResponse.json({ sprint: completedSprint, backlog: [], todo: [task], in_progress: [], blocked: [], done: [] })
      }),
    )
    renderWithProviders(<Routes><Route element={<BoardPage />} path="/projects/:projectId/board" /></Routes>, '/projects/7/board?sprint=9')

    expect(await screen.findByText('Solo lectura')).toBeInTheDocument()
    expect(screen.getByLabelText('Sprint')).toHaveValue('9')
    expect(screen.queryByRole('button', { name: 'Mover Documentar API' })).not.toBeInTheDocument()
  })
})
