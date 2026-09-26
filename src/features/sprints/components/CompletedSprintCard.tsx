import { CalendarCheck2 } from 'lucide-react'

import { Badge } from '@/components/common/Badge'
import { StoryPointsSummary } from '@/features/sprints/components/StoryPointsSummary'
import type { SprintSummary } from '@/features/sprints/types'

interface CompletedSprintCardProps {
  sprint: SprintSummary
}

function formatDate(value: string | null) {
  if (!value) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(value))
}

export function CompletedSprintCard({ sprint }: CompletedSprintCardProps) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-zinc-950">{sprint.name}</h3>
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
            <CalendarCheck2 aria-hidden="true" size={15} />
            Completado {formatDate(sprint.completed_at)}
          </p>
        </div>
        <Badge>Completado</Badge>
      </div>
      <div className="mt-6">
        <StoryPointsSummary
          completed={sprint.completed_points}
          label={`Resultado de ${sprint.name}`}
          percentage={sprint.progress_percentage}
          total={sprint.planned_points}
        />
      </div>
    </article>
  )
}
