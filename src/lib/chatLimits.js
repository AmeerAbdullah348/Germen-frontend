import { readJSON, writeJSON } from './storage'

const KEY = 'gla:chatUsage'
// Keeps a single user from burning through the whole app's shared free-tier
// Groq quota. This is a soft, client-side cap for UX; the edge function
// should also enforce a hard limit server-side once deployed.
export const DAILY_MESSAGE_LIMIT = 30

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getRemainingMessages() {
  const usage = readJSON(KEY, { date: null, count: 0 })
  if (usage.date !== todayKey()) return DAILY_MESSAGE_LIMIT
  return Math.max(0, DAILY_MESSAGE_LIMIT - usage.count)
}

export function recordMessageSent() {
  const today = todayKey()
  const usage = readJSON(KEY, { date: today, count: 0 })
  const next = usage.date === today ? { date: today, count: usage.count + 1 } : { date: today, count: 1 }
  writeJSON(KEY, next)
  return next.count
}
