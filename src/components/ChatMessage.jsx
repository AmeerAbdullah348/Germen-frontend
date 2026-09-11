import ReactMarkdown from 'react-markdown'

// Assistant replies are asked (via the system prompt) to use *italics* for
// German words — without rendering markdown that shows up as literal
// asterisks instead of formatting. User messages are plain text (nothing
// they type needs interpreting as markdown).
const COMPONENTS = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  code: ({ children }) => (
    <code className="bg-gray-100 rounded px-1 py-0.5 text-[0.85em] font-mono">{children}</code>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
      {children}
    </a>
  ),
}

export default function ChatMessage({ text }) {
  return <ReactMarkdown components={COMPONENTS}>{text}</ReactMarkdown>
}
