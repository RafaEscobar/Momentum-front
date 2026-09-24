import { forwardRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      className={`min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 aria-[invalid=true]:border-red-600 ${className}`}
      ref={ref}
      {...props}
    />
  )
})
