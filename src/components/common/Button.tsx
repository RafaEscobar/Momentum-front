import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-800 text-white hover:bg-emerald-900',
  secondary: 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
  danger: 'bg-red-700 text-white hover:bg-red-800',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  icon: 'size-9',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', size = 'md', variant = 'primary', type = 'button', ...props },
  ref,
) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      type={type}
      {...props}
    />
  )
})
