import { ChevronLeft, MessageSquarePlus, RotateCcw, Send, Sparkles } from 'lucide-react'
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
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">This scenario couldn't be loaded.</p>
        <Link to="/conversation" className="text-cyan-400 font-bold hover:underline">
          Back to Conversation Practice
        </Link>
      </div>
    )
  }

  async function send(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

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
    setMessages((m) => m.slice(0, -1))
    send(last)
  }

  function handleNewChat() {
    if (sending) return
    setMessages([welcome])
    lastFailedRef.current = null
  }

  return (
    <div className="flex flex-col h-full bg-[#070b19] text-slate-100">
      {/* Header */}
      <div className="px-5 pt-6 pb-3.5 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl shrink-0 flex items-start justify-between z-10 shadow-md">
        <div className="flex items-start gap-2.5 min-w-0">
          <Link to="/conversation" className="text-slate-400 hover:text-white shrink-0 mt-1">
            <ChevronLeft size={22} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-white truncate">{scenario.label}</h1>
            <p className="text-xs text-indigo-300 font-medium truncate">
              {level === 'beginner' ? 'Beginner · English help' : 'Advanced · German only'} · {remaining} left
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={messages.length <= 1}
          className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-default transition-all shrink-0 cursor-pointer"
        >
          <MessageSquarePlus size={15} /> Restart
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={[
              'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg',
              m.role === 'user'
                ? 'self-end bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-xs shadow-[0_4px_15px_rgba(99,102,241,0.3)] font-medium'
                : 'self-start bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-xs backdrop-blur-md',
            ].join(' ')}
          >
            {m.role === 'assistant' ? <ChatMessage text={m.text} /> : m.text}
          </div>
        ))}

        {sending && (
          <div className="self-start bg-slate-900/90 border border-white/10 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-indigo-300/80 flex items-center gap-2">
            <Sparkles size={14} className="animate-spin text-indigo-400" /> Typing…
          </div>
        )}

        {lastFailedRef.current && !sending && (
          <button
            type="button"
            onClick={handleRetry}
            className="self-start flex items-center gap-1.5 text-xs text-rose-400 font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30"
          >
            <RotateCcw size={13} /> Retry failed message
          </button>
        )}
      </div>

      {/* Form Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="shrink-0 bg-slate-900/95 border-t border-white/10 p-3.5 flex gap-2.5 backdrop-blur-xl z-10"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          placeholder={level === 'advanced' ? 'Antworten Sie auf Deutsch...' : 'Type your reply in German...'}
          disabled={sending}
          className="flex-1 rounded-xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white w-12 h-12 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
