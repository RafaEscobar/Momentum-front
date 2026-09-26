import { ProgressBar } from '@/components/common/ProgressBar'

interface StoryPointsSummaryProps {
  completed: number
  total: number
  percentage: number
  label?: string
}

export function StoryPointsSummary({ completed, total, percentage, label = 'Progreso del Sprint' }: StoryPointsSummaryProps) {
  const normalizedPercentage = Math.round(Math.min(100, Math.max(0, percentage)))

  return <div>
    <div className="mb-2 flex items-end justify-between gap-4"><div><p className="text-xs font-medium text-zinc-500">Story Points</p><p className="mt-0.5 text-sm font-semibold text-zinc-800">{completed} / {total} Story Points</p></div><span className="text-sm font-semibold text-emerald-800">{normalizedPercentage}%</span></div>
    <ProgressBar label={label} value={normalizedPercentage} />
  </div>
}
