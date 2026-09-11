import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { signIn, signUp, validateEmail, validatePassword } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'

export default function Auth() {
  const { user, loading: sessionLoading } = useAuth()
  const [mode, setMode] = useState('signup') // 'signup' | 'login'
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
    if (submitting) return // guard against double-submit

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
    // Otherwise AuthContext's onAuthStateChange picks up the new session
    // and the redirect above takes over.
  }

  if (confirmationSent) {
    return (
      <div className="min-h-svh flex flex-col justify-center items-center gap-4 px-6 mx-auto max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Check your email 📬</h1>
        <p className="text-gray-500">
          We sent a confirmation link to <span className="font-medium">{email}</span>. Click it,
          then come back and log in.
        </p>
        <button
          type="button"
          onClick={() => {
            setConfirmationSent(false)
            setMode('login')
          }}
          className="text-primary-600 font-medium"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col justify-center items-center gap-8 px-6 mx-auto max-w-md">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-900">Willkommen! 👋</h1>
        <p className="text-gray-500">Learn real, usable German — fast.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        {mode === 'signup' && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            className="rounded-xl border border-gray-200 px-4 py-3 text-lg"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoFocus
          className="rounded-xl border border-gray-200 px-4 py-3 text-lg"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded-xl border border-gray-200 px-4 py-3 text-lg"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-primary-600 disabled:bg-gray-300 text-white py-3 font-medium text-lg"
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
        className="text-sm text-gray-500"
      >
        {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </button>
    </div>
  )
}
