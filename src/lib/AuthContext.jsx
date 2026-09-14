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
  //
  // Raced against a timeout: local-first data is already usable immediately,
  // so if the network is slow or unreachable (e.g. reloading the PWA while
  // offline), the user isn't stuck on the loading skeleton for however long
  // Supabase's own retry/backoff takes to give up (observed ~8s offline).
  // hydrateFromRemote keeps running in the background regardless and still
  // applies whatever it gets once it does settle — this only affects how
  // long the UI blocks, not whether hydration eventually happens.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId || hydratedForUserId.current === userId) return

    hydratedForUserId.current = userId
    setHydrated(false)

    let settled = false
    const markHydrated = () => {
      if (settled) return
      settled = true
      setHydrated(true)
    }

    hydrateFromRemote(userId).finally(markHydrated)
    const timeoutId = setTimeout(markHydrated, 3000)
    return () => clearTimeout(timeoutId)
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
