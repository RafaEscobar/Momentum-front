import ReactMarkdown from 'react-markdown'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return <p className="text-sm text-zinc-500">Escribe contenido para ver la vista previa.</p>
  }

  return (
    <div className="space-y-3 break-words text-sm leading-6 text-zinc-700">
      <ReactMarkdown
        components={{
          a: ({ children, ...props }) => <a {...props} className="font-medium text-emerald-800 underline hover:text-emerald-950">{children}</a>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-300 pl-4 italic text-zinc-600">{children}</blockquote>,
          code: ({ children }) => <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs text-zinc-900">{children}</code>,
          h1: ({ children }) => <h1 className="text-xl font-semibold text-zinc-950">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold text-zinc-950">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-semibold text-zinc-950">{children}</h3>,
          li: ({ children }) => <li className="ml-5 list-disc">{children}</li>,
          ol: ({ children }) => <ol className="space-y-1">{children}</ol>,
          p: ({ children }) => <p>{children}</p>,
          pre: ({ children }) => <pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 text-zinc-100">{children}</pre>,
          ul: ({ children }) => <ul className="space-y-1">{children}</ul>,
        }}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
