import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'

import { Component as ProjectOverviewPage } from '@/pages/ProjectOverviewPage'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/server'

describe('Project Overview', () => {
  it('shows progress, active Sprint, task counts and quick actions', async () => {
    const prefetched = { backlog: 0, board: 0, sprints: 0, stats: 0 }
    const emptyPagination = {
      data: [],
      links: { first: '', last: '', prev: null, next: null },
      meta: { current_page: 1, from: null, last_page: 1, per_page: 15, to: null, total: 0 },
    }

    server.use(
      http.get('*/api/projects/7', () => HttpResponse.json({ data: { id: 7, name: 'Momentum', description: 'Gestor personal', status: 'active', priority: 'high', color: '#059669', icon: null, progress: 40, start_date: '2026-09-01', target_date: '2026-10-31', created_at: '', updated_at: '' } })),
      http.get('*/api/projects/7/stats', () => {
        prefetched.stats += 1
        return HttpResponse.json({ progress: 40, story_points: { total: 25, completed: 10 }, tasks: { total: 15, backlog: 3, todo: 4, in_progress: 2, blocked: 1, done: 5 }, active_sprint: { id: 3, project_id: 7, name: 'Sprint 7', start_date: '2026-09-20', end_date: '2026-10-03', status: 'active', planned_points: 20, completed_points: 8, progress_percentage: 40, completed_at: null } })
      }),
      http.get('*/api/projects/7/backlog', () => {
        prefetched.backlog += 1
        return HttpResponse.json({
          ...emptyPagination,
          meta: { ...emptyPagination.meta, story_points_total: 0 },
        })
      }),
      http.get('*/api/projects/7/board', () => {
        prefetched.board += 1
        return HttpResponse.json({ sprint: null, backlog: [], todo: [], in_progress: [], blocked: [], done: [] })
      }),
      http.get('*/api/projects/7/sprints', () => {
        prefetched.sprints += 1
        return HttpResponse.json(emptyPagination)
      }),
    )

    renderWithProviders(<Routes><Route element={<ProjectOverviewPage />} path="/projects/:projectId" /></Routes>, '/projects/7')

    expect(await screen.findByRole('heading', { name: 'Momentum' })).toBeInTheDocument()
    expect(screen.getByText('Sprint 7')).toBeInTheDocument()
    expect(screen.getByText('Story Points')).toBeInTheDocument()
    expect(screen.getByText('10 / 25')).toBeInTheDocument()
    expect(screen.getByText('15 tareas en el proyecto')).toBeInTheDocument()
    expect(screen.getByText('3', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('4', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('2', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('1', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByText('5', { selector: 'dd' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crear tarea' })).toHaveAttribute('href', '/projects/7/backlog?create=task')
    expect(screen.getByRole('link', { name: 'Abrir Backlog' })).toHaveAttribute('href', '/projects/7/backlog')
    expect(screen.getByRole('link', { name: 'Abrir Board' })).toHaveAttribute('href', '/projects/7/board')
    await waitFor(() => {
      expect(prefetched).toEqual({ backlog: 1, board: 1, sprints: 1, stats: 1 })
    })
  })
})
