interface PagePlaceholderProps {
  title: string
}

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm text-zinc-600">This section is ready for implementation.</p>
    </section>
  )
}
