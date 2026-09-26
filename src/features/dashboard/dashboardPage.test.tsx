import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { Component as DashboardPage } from '@/pages/DashboardPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

const dashboard = {
  projects: [{
    id: 7,
    name: 'Momentum',
    status: 'active',
    priority: 'high',
    color: '#059669',
    icon: null,
    progress: 42,
    tasks_count: 8,
    created_at: '2026-09-01T12:00:00.000000Z',
    updated_at: '2026-09-24T12:00:00.000000Z',
  }],
  active_sprints: [{
    id: 3,
    project_id: 7,
    name: 'Sprint 3',
    start_date: '2026-09-21',
    end_date: '2026-10-02',
    status: 'active',
    planned_points: 21,
    completed_points: 8,
    progress_percentage: 38.1,
    completed_at: null,
  }],
  summary: {
    active_projects: 1,
    planned_story_points: 21,
    completed_story_points: 8,
    pending_tasks: 4,
    in_progress_tasks: 2,
    completed_tasks: 6,
  },
  recent_activity: [{
    id: 30,
    project_id: 7,
    type: 'task_status_changed',
    description: 'Estado de Documentar API: todo -> in_progress',
    metadata: { from: 'todo', to: 'in_progress' },
    subject: { id: 10, type: 'task', label: 'Documentar API' },
    created_at: '2026-09-24T18:30:00.000000Z',
  }],
}

describe('Dashboard page', () => {
  it('shows the dashboard summary and complete project cards', async () => {
    server.use(
      http.get('*/api/dashboard', () => HttpResponse.json(dashboard)),
      http.get('*/api/projects/7/sprints/3', () => HttpResponse.json({
        data: {
          ...dashboard.active_sprints[0],
          goal: 'Publicar el primer flujo operativo.',
          created_at: '2026-09-21T12:00:00.000000Z',
          updated_at: '2026-09-24T12:00:00.000000Z',
        },
      })),
    )

    renderWithProviders(<DashboardPage />, '/dashboard')

    expect(await screen.findByRole('heading', { name: 'Buen día' })).toBeInTheDocument()
    expect(screen.getByText('Proyectos activos').nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Tareas pendientes').nextElementSibling).toHaveTextContent('4')
    expect(screen.getByText('En progreso').nextElementSibling).toHaveTextContent('2')
    expect(screen.getByText('Completadas').nextElementSibling).toHaveTextContent('6')
    expect(screen.getByRole('heading', { name: 'Momentum' })).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Prioridad alta')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Progreso de Momentum: 42%' })).toBeInTheDocument()
    expect(screen.getAllByText('Sprint 3')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Abrir' })).toHaveAttribute('href', '/projects/7')
    expect(await screen.findByText('Publicar el primer flujo operativo.')).toBeInTheDocument()
    expect(screen.getByText('8 / 21 Story Points')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Abrir Board' })).toHaveAttribute(
      'href',
      '/projects/7/board?sprint=3',
    )
    expect(screen.getByText('Estado de Documentar API: todo -> in_progress')).toBeInTheDocument()
  })

  it('shows the empty states returned by the dashboard endpoint', async () => {
    server.use(http.get('*/api/dashboard', () => HttpResponse.json({
      projects: [],
      active_sprints: [],
      summary: {
        active_projects: 0,
        planned_story_points: 0,
        completed_story_points: 0,
        pending_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
      },
      recent_activity: [],
    })))

    renderWithProviders(<DashboardPage />, '/dashboard')

    expect(await screen.findByText('No hay proyectos activos')).toBeInTheDocument()
    expect(screen.getByText('No hay sprints activos.')).toBeInTheDocument()
    expect(screen.getByText('Todavía no hay actividad reciente.')).toBeInTheDocument()
  })
})
