import { Navigate, createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      lazy: () => import('@/pages/LoginPage'),
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', lazy: () => import('@/pages/DashboardPage') },
            { path: 'notes', lazy: () => import('@/pages/GeneralNotesPage') },
            { path: 'projects', lazy: () => import('@/pages/ProjectsPage') },
            { path: 'projects/:projectId', lazy: () => import('@/pages/ProjectOverviewPage') },
            { path: 'projects/:projectId/backlog', lazy: () => import('@/pages/BacklogPage') },
            { path: 'projects/:projectId/tasks', lazy: () => import('@/pages/TasksPage') },
            { path: 'projects/:projectId/board', lazy: () => import('@/pages/BoardPage') },
            { path: 'projects/:projectId/sprints', lazy: () => import('@/pages/SprintsPage') },
            { path: 'projects/:projectId/notes', lazy: () => import('@/pages/NotesPage') },
            { path: 'projects/:projectId/activity', lazy: () => import('@/pages/ActivityPage') },
          ],
        },
      ],
    },
    { path: '*', lazy: () => import('@/pages/NotFoundPage') },
  ],
  { basename: import.meta.env.BASE_URL },
)
