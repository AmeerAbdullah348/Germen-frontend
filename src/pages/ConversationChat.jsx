import { ChevronLeft, MessageSquarePlus, RotateCcw, Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import ChatMessage from '../components/ChatMessage'
import { SCENARIOS_BY_ID } from '../data/conversation/scenarios'
import { getRemainingMessages } from '../lib/chatLimits'
import { MAX_INPUT_LENGTH, sendConversationMessage } from '../lib/conversationApi'

export default function ConversationChat() {
  const { scenarioId } = useParams()
  const location = useLocation()
  const level = location.state?.level === 'advanced' ? 'advanced' : 'beginner'
  const scenario = SCENARIOS_BY_ID[scenarioId]

  const welcome = { role: 'assistant', text: scenario?.opener ?? 'Hallo!' }
  const [messages, setMessages] = useState([welcome])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [remaining, setRemaining] = useState(getRemainingMessages())
  const lastFailedRef = useRef(null)

  if (!scenario) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">This scenario couldn't be loaded.</p>
        <Link to="/conversation" className="text-primary-600 font-medium">
          Back to Conversation Practice
        </Link>
      </div>
    )
  }

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return // guard: empty message / double-submit while sending

    const history = messages
      .filter((m) => m !== welcome)
      .filter((m) => m.role === 'user' || m.status === 'ok')
      .map((m) => ({ role: m.role, text: m.text }))

    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setSending(true)
    lastFailedRef.current = null

    const result = await sendConversationMessage(trimmed, history, scenarioId, level)

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
    setMessages([welcome])
    lastFailedRef.current = null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-3 border-b border-gray-200 bg-white shrink-0 flex items-start justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <Link to="/conversation" className="text-gray-400 shrink-0 mt-0.5">
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{scenario.label}</h1>
            <p className="text-xs text-gray-400">
              {level === 'beginner' ? 'Beginner · English help' : 'Advanced · German only'} ·{' '}
              {remaining} messages left today
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={messages.length <= 1}
          className="flex items-center gap-1.5 text-sm text-primary-600 font-medium disabled:text-gray-300 disabled:cursor-default shrink-0"
        >
          <MessageSquarePlus size={16} /> Restart
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
          placeholder={level === 'advanced' ? 'Antworten Sie auf Deutsch...' : 'Type your reply in German...'}
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
