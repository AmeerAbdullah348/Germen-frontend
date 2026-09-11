import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Falls back to null when env vars are missing so the app can still run
// against local-only mock data (see progress.js / user.js) instead of crashing.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
