import ReactMarkdown from 'react-markdown'

const COMPONENTS = {
  p: ({ children }) => <p className="mb-2 last:mb-0 break-words [overflow-wrap:anywhere]">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold break-words">{children}</strong>,
  em: ({ children }) => <em className="italic break-words">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-0.5 break-words">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-0.5 break-words">{children}</ol>,
  li: ({ children }) => <li className="break-words">{children}</li>,
  code: ({ children }) => (
    <code className="bg-slate-800 text-cyan-300 rounded px-1.5 py-0.5 text-[0.85em] font-mono break-all font-semibold border border-white/10 inline-block max-w-full overflow-x-auto">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-slate-950 p-3 rounded-xl border border-white/10 overflow-x-auto my-2 max-w-full text-xs font-mono text-cyan-300">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline break-all text-cyan-400">
      {children}
    </a>
  ),
}

export default function ChatMessage({ text }) {
  return (
    <div className="break-words [overflow-wrap:anywhere] min-w-0 max-w-full overflow-hidden leading-relaxed">
      <ReactMarkdown components={COMPONENTS}>{text}</ReactMarkdown>
    </div>
  )
}
