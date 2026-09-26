import {
  CheckCircle2,
  CirclePlus,
  FolderPen,
  Play,
  RefreshCw,
  Rocket,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Activity, ActivityType } from '@/features/activity/types'

const activityPresentation: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  project_created: { label: 'Proyecto creado', icon: CirclePlus },
  project_updated: { label: 'Proyecto actualizado', icon: FolderPen },
  task_created: { label: 'Tarea creada', icon: CirclePlus },
  task_status_changed: { label: 'Estado actualizado', icon: RefreshCw },
  task_completed: { label: 'Tarea completada', icon: CheckCircle2 },
  sprint_created: { label: 'Sprint creado', icon: Rocket },
  sprint_started: { label: 'Sprint iniciado', icon: Play },
  sprint_completed: { label: 'Sprint completado', icon: CheckCircle2 },
}

const dayFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' })

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

function dayLabel(value: string) {
  const date = new Date(value)
  const difference = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000)

  if (difference === 0) return 'Hoy'
  if (difference === 1) return 'Ayer'
  return dayFormatter.format(date)
}

function resourceLink(activity: Activity) {
  if (activity.subject?.type === 'task') {
    return `/projects/${activity.project_id}/board?task=${activity.subject.id}&action=edit`
  }

  if (activity.subject?.type === 'sprint') {
    return `/projects/${activity.project_id}/board?sprint=${activity.subject.id}`
  }

  if (activity.type.startsWith('project_')) {
    return `/projects/${activity.project_id}`
  }

  return null
}

interface ActivityTimelineProps {
  activities: Activity[]
  projectNames?: ReadonlyMap<number, string>
}

export function ActivityTimeline({ activities, projectNames }: ActivityTimelineProps) {
  const groups = activities.reduce<Array<{ label: string; items: Activity[] }>>((result, activity) => {
    const label = dayLabel(activity.created_at)
    const current = result.at(-1)

    if (current?.label === label) current.items.push(activity)
    else result.push({ label, items: [activity] })

    return result
  }, [])

  return (
    <div className="divide-y divide-zinc-200">
      {groups.map((group) => (
        <section aria-labelledby={`activity-day-${group.items[0].id}`} className="p-4 sm:p-5" key={`${group.label}-${group.items[0].id}`}>
          <h3 className="text-xs font-semibold uppercase text-zinc-500" id={`activity-day-${group.items[0].id}`}>
            {group.label}
          </h3>
          <ol className="mt-4 space-y-5">
            {group.items.map((activity) => {
              const presentation = activityPresentation[activity.type]
              const Icon = presentation.icon
              const link = resourceLink(activity)
              const content = (
                <>
                  <p className="text-sm font-medium text-zinc-900">{activity.description}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                    <span>{presentation.label}</span>
                    {projectNames?.get(activity.project_id) && <span>{projectNames.get(activity.project_id)}</span>}
                  </div>
                </>
              )

              return (
                <li className="grid grid-cols-[3.5rem_1.75rem_minmax(0,1fr)] gap-2" key={activity.id}>
                  <time className="pt-1 text-xs font-medium text-zinc-500" dateTime={activity.created_at}>
                    {timeFormatter.format(new Date(activity.created_at))}
                  </time>
                  <span className="grid size-7 place-items-center rounded-full bg-emerald-50 text-emerald-800">
                    <Icon aria-hidden="true" size={14} />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    {link ? (
                      <Link className="block rounded-sm hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-emerald-700" to={link}>
                        {content}
                      </Link>
                    ) : content}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
