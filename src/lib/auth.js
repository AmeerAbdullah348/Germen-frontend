import { supabase } from './supabaseClient'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  return EMAIL_RE.test(email.trim())
}

// Supabase's own minimum; checking client-side gives a friendlier error
// before round-tripping to the API.
export function validatePassword(password) {
  return password.length >= 6
}

function friendlyAuthError(error) {
  if (!error) return null
  const msg = error.message || ''
  if (/already registered|already exists/i.test(msg)) {
    return 'An account with that email already exists — try logging in instead.'
  }
  if (/invalid login credentials/i.test(msg)) {
    return 'Incorrect email or password.'
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Please confirm your email first — check your inbox for a confirmation link.'
  }
  if (/Failed to fetch|NetworkError/i.test(msg)) {
    return "Couldn't reach the server — check your connection and try again."
  }
  return msg
}

export async function signUp({ email, password, name }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() || 'Learner' } },
    })
    if (error) return { error: friendlyAuthError(error) }

    // Supabase returns a user with no session when email confirmation is required.
    const needsConfirmation = !data.session
    return { data, needsConfirmation }
  } catch {
    return { error: "Couldn't reach the server — check your connection and try again." }
  }
}

export async function signIn({ email, password }) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) return { error: friendlyAuthError(error) }
    return { data }
  } catch {
    return { error: "Couldn't reach the server — check your connection and try again." }
  }
}

export async function signOut() {
  await supabase.auth.signOut()
}
