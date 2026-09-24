interface ProgressBarProps {
  value: number
  label?: string
}

export function ProgressBar({ value, label = 'Progreso' }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  return (
    <div
      aria-label={`${label}: ${normalizedValue}%`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalizedValue}
      className="h-2 overflow-hidden rounded-full bg-zinc-100"
      role="progressbar"
    >
      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${normalizedValue}%` }} />
    </div>
  )
}
