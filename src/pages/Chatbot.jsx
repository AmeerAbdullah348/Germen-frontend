import { MessageSquarePlus, RotateCcw, Send, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
    if (!trimmed || sending) return

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
    setMessages((m) => m.slice(0, -1))
    send(last)
  }

  function handleNewChat() {
    if (sending) return
    setMessages([WELCOME])
    lastFailedRef.current = null
  }

  return (
    <div className="flex flex-col h-full bg-[#070b19] text-slate-100 min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-6 pb-3.5 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl shrink-0 flex items-start justify-between z-10 shadow-md">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-white">German Tutor</h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              {remaining} left today
            </span>
          </div>
          <Link to="/conversation" className="text-xs text-cyan-400 font-medium hover:underline flex items-center gap-1 truncate">
            <Sparkles size={12} className="shrink-0" /> Practice a real conversation instead →
          </Link>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          disabled={messages.length <= 1}
          className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-full hover:bg-cyan-500/20 disabled:opacity-40 disabled:cursor-default transition-all shrink-0 cursor-pointer"
        >
          <MessageSquarePlus size={15} /> New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3.5 min-w-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={[
              'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word] overflow-hidden',
              m.role === 'user'
                ? 'self-end bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs shadow-[0_4px_15px_rgba(37,99,235,0.3)] font-medium'
                : 'self-start bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-xs backdrop-blur-md',
            ].join(' ')}
          >
            {m.role === 'assistant' ? (
              <ChatMessage text={m.text} />
            ) : (
              <div className="break-words [overflow-wrap:anywhere] [word-break:break-word] min-w-0 max-w-full">
                {m.text}
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="self-start bg-slate-900/90 border border-white/10 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-cyan-400/70 flex items-center gap-2">
            <Sparkles size={14} className="animate-spin" /> Thinking…
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

      {/* Input Form */}
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
          placeholder="Ask about German grammar, words..."
          disabled={sending}
          className="flex-1 rounded-xl bg-slate-950/80 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 outline-none focus:ring-1 focus:ring-cyan-500 min-w-0 break-words [overflow-wrap:anywhere] [word-break:break-word]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white w-12 h-12 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
