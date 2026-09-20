import { Navigate, createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/login',
    lazy: () => import('@/pages/LoginPage'),
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', lazy: () => import('@/pages/DashboardPage') },
      { path: 'projects', lazy: () => import('@/pages/ProjectsPage') },
      { path: 'projects/:projectId', lazy: () => import('@/pages/ProjectOverviewPage') },
      { path: 'projects/:projectId/backlog', lazy: () => import('@/pages/BacklogPage') },
      { path: 'projects/:projectId/board', lazy: () => import('@/pages/BoardPage') },
      { path: 'projects/:projectId/sprints', lazy: () => import('@/pages/SprintsPage') },
      { path: 'projects/:projectId/notes', lazy: () => import('@/pages/NotesPage') },
      { path: 'projects/:projectId/activity', lazy: () => import('@/pages/ActivityPage') },
    ],
  },
  { path: '*', lazy: () => import('@/pages/NotFoundPage') },
])
