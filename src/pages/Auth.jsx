import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { signIn, signUp, validateEmail, validatePassword } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'

export default function Auth() {
  const { user, loading: sessionLoading } = useAuth()
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  if (!sessionLoading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please fill in both email and password.')
      return
    }
    if (!validateEmail(trimmedEmail)) {
      setError('That email address doesn’t look right.')
      return
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters.')
      return
    }

    setError(null)
    setSubmitting(true)

    const result =
      mode === 'signup'
        ? await signUp({ email: trimmedEmail, password, name })
        : await signIn({ email: trimmedEmail, password })

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (result.needsConfirmation) {
      setConfirmationSent(true)
    }
  }

  if (confirmationSent) {
    return (
      <div className="min-h-svh flex flex-col justify-center items-center gap-5 px-6 mx-auto max-w-md text-center bg-[#070b19] text-slate-100">
        <h1 className="text-3xl font-extrabold text-white">Check your email 📬</h1>
        <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
          We sent a confirmation link to <span className="font-bold text-cyan-300">{email}</span>. Click it,
          then come back and log in.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmationSent(false)
            setMode('login')
          }}
          className="text-cyan-400 font-bold hover:underline text-sm cursor-pointer"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col justify-center items-center gap-8 px-6 mx-auto max-w-md bg-[#070b19] text-slate-100 relative overflow-hidden">
      {/* Radial background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center flex flex-col gap-2 relative z-10">
        <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">Willkommen! 👋</h1>
        <p className="text-slate-400 text-sm font-medium">Learn real, usable German — fast.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 relative z-10">
        {mode === 'signup' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className="rounded-2xl bg-slate-900/90 border border-white/10 px-4.5 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
          className="rounded-2xl bg-slate-900/90 border border-white/10 px-4.5 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-2xl bg-slate-900/90 border border-white/10 px-4.5 py-3.5 text-base text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
        />

        {error && <p className="text-xs font-bold text-rose-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white py-3.5 font-bold text-base shadow-[0_4px_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer mt-1"
        >
          {submitting ? 'Please wait…' : mode === 'signup' ? 'Get Started' : 'Log In'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'signup' ? 'login' : 'signup'))
          setError(null)
        }}
        className="text-xs text-slate-400 hover:text-white transition-colors relative z-10 cursor-pointer"
      >
        {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}
