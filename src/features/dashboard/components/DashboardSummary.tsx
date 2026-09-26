import { CheckCircle2, FolderOpen, ListTodo, Rocket } from 'lucide-react'

import type { DashboardSummary as DashboardSummaryData } from '@/features/dashboard/types'

interface DashboardSummaryProps {
  summary: DashboardSummaryData
}

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  const items = [
    { label: 'Proyectos activos', value: summary.active_projects, icon: FolderOpen },
    { label: 'Tareas pendientes', value: summary.pending_tasks, icon: ListTodo },
    { label: 'En progreso', value: summary.in_progress_tasks, icon: Rocket },
    { label: 'Completadas', value: summary.completed_tasks, icon: CheckCircle2 },
  ]

  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ icon: Icon, label, value }) => (
        <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm" key={label}>
          <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500">
            <Icon aria-hidden="true" size={16} />
            {label}
          </dt>
          <dd className="mt-3 text-2xl font-semibold text-zinc-950">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
