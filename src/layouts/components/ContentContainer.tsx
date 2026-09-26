import type { PropsWithChildren } from 'react'

export function ContentContainer({ children }: PropsWithChildren) {
  return <main className="mx-auto w-full max-w-7xl flex-1 p-3 sm:p-6 lg:p-8">{children}</main>
}
