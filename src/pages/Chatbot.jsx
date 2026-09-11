import { MessageSquarePlus, RotateCcw, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import ChatMessage from '../components/ChatMessage'
import { askChatbot, MAX_INPUT_LENGTH } from '../lib/chatApi'
import { getRemainingMessages } from '../lib/chatLimits'

const WELCOME = {
  role: 'assistant',
  text: "Hallo! I'm your German learning assistant. Ask me about grammar, vocabulary, or translations — I'll only help with German learning topics.",
}

export default function Chatbot() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(getRemainingMessages())
  const lastFailedRef = useRef(null)

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return // guard: empty message / double-submit while sending

    // Only real exchanges count as context — the welcome greeting and any
    // error/rate-limit messages aren't actual conversation content and would
    // confuse follow-ups like "give me another example".
    const history = messages
      .filter((m) => m !== WELCOME)
      .filter((m) => m.role === 'user' || m.status === 'ok' || m.status === 'cached')
      .map((m) => ({ role: m.role, text: m.text }))

    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setSending(true)
    lastFailedRef.current = null

    const result = await askChatbot(trimmed, history)

    setMessages((m) => [...m, { role: 'assistant', text: result.text, status: result.status }])
    setRemaining(getRemainingMessages())
    setSending(false)

    if (result.status === 'error') {
      lastFailedRef.current = trimmed
    }
  }

  function handleRetry() {
    const last = lastFailedRef.current
    if (!last) return
    setMessages((m) => m.slice(0, -1)) // drop the error message before retrying
    send(last)
  }

  function handleNewChat() {
    if (sending) return // guard: don't reset mid-request
    setMessages([WELCOME])
    lastFailedRef.current = null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3 border-b border-gray-200 bg-white shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">German Tutor</h1>
          <p className="text-xs text-gray-400">{remaining} questions left today</p>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={messages.length <= 1}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium disabled:text-gray-300 disabled:cursor-default"
        >
          <MessageSquarePlus size={16} /> New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={[
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              m.role === 'user'
                ? 'self-end bg-primary-600 text-white'
                : 'self-start bg-white border border-gray-200 text-gray-800',
            ].join(' ')}
          >
            {m.role === 'assistant' ? <ChatMessage text={m.text} /> : m.text}
          </div>
        ))}

        {sending && (
          <div className="self-start bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-400">
            Typing…
          </div>
        )}

        {lastFailedRef.current && !sending && (
          <button
            type="button"
            onClick={handleRetry}
            className="self-start flex items-center gap-1.5 text-sm text-primary-600 font-medium px-2"
          >
            <RotateCcw size={14} /> Retry
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="shrink-0 bg-white border-t border-gray-200 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          placeholder="Ask about German grammar, words..."
          disabled={sending}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-primary-600 disabled:bg-gray-300 text-white w-11 h-11 flex items-center justify-center shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
