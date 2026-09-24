import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', ...props }, ref) {
    return (
      <select
        className={`h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 aria-[invalid=true]:border-red-600 ${className}`}
        ref={ref}
        {...props}
      />
    )
  },
)
