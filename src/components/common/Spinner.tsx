import { LoaderCircle } from 'lucide-react'

interface SpinnerProps {
  size?: number
}

export function Spinner({ size = 18 }: SpinnerProps) {
  return <LoaderCircle aria-hidden="true" className="animate-spin" size={size} />
}
