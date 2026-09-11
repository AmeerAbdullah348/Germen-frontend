import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { flushPendingSync, hydrateFromRemote } from './remoteSync'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [hydrated, setHydrated] = useState(!isSupabaseConfigured)
  const hydratedForUserId = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  // Pull the authoritative copy down from Supabase once per login — not on
  // every session refresh, since that would clobber changes made since.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || hydratedForUserId.current === userId) return

    hydratedForUserId.current = userId
    setHydrated(false)
    hydrateFromRemote(userId).finally(() => setHydrated(true))
  }, [session?.user?.id])

  // Retry any writes that failed while offline as soon as connectivity returns.
  useEffect(() => {
    if (!isSupabaseConfigured) return
    function handleOnline() {
      const userId = session?.user?.id
      if (userId) flushPendingSync(userId)
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [session?.user?.id])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, hydrated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
