import { UNITS } from '../data/units'
import { todayKey } from './dateKeys'
import { DAILY_CHALLENGE_BONUS_XP, isDailyChallengeDoneToday } from './dailyChallenge'
import { DAILY_XP_GOAL, getDailyXp, getDueWordIds, getState } from './progress'
import { readJSON, writeJSON } from './storage'

// Foreground reminders only — shown via the Notification API while the app
// is open (or backgrounded but still running), not true background push.
// Real "notify even when the app is fully closed" push needs a server-side
// push service (VAPID keys, per-user subscriptions, a scheduled trigger to
// fire them) — real infrastructure this local-first, no-backend-beyond-
// Supabase app doesn't have. This is the honest version of "reminders where
// PWA/browser capabilities allow" for that constraint.

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission() {
  return isNotificationSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return await Notification.requestPermission()
}

const ENABLED_KEY = 'gla:remindersEnabled'

export function areRemindersEnabled() {
  return readJSON(ENABLED_KEY, false)
}

export function setRemindersEnabled(enabled) {
  writeJSON(ENABLED_KEY, enabled)
}

// --- Once-per-day dedup, so a reminder doesn't fire every time the app opens ---
const SHOWN_KEY = 'gla:reminderShownToday'

function getShownToday(now) {
  const rec = readJSON(SHOWN_KEY, { date: null, types: [] })
  return rec.date === todayKey(now) ? rec.types : []
}

function markShownToday(type, now) {
  const types = getShownToday(now)
  if (!types.includes(type)) {
    writeJSON(SHOWN_KEY, { date: todayKey(now), types: [...types, type] })
  }
}

function notify(title, body) {
  if (getNotificationPermission() !== 'granted') return
  try {
    // eslint-disable-next-line no-new -- fire-and-forget, the browser owns the lifecycle
    new Notification(title, { body, icon: '/pwa-192x192.png' })
  } catch {
    // Some mobile browsers require going through the service worker
    // registration instead of the plain constructor — best-effort, so a
    // throw here just means no reminder shows this time.
  }
}

// Checks, in priority order, whether a reminder is worth showing right now,
// and shows at most one so as not to spam. Call this once per app session
// (e.g. on Dashboard mount) — it's cheap and a no-op once today's reminder
// has already been shown or reminders aren't enabled.
export function checkAndNotify(now = new Date()) {
  if (!areRemindersEnabled() || getNotificationPermission() !== 'granted') return
  if (getShownToday(now).length > 0) return

  const state = getState()

  if (state.streak.count > 0 && state.streak.lastActiveDay !== todayKey(now)) {
    notify('Keep your streak going! 🔥', `You're on a ${state.streak.count}-day streak — practice today to keep it alive.`)
    markShownToday('streak', now)
    return
  }

  const allWordIds = UNITS.flatMap((unit) => unit.vocab.map((word) => word.id))
  const dueCount = getDueWordIds(allWordIds, now).length
  if (dueCount > 0) {
    notify('Words are ready for review', `You have ${dueCount} word${dueCount === 1 ? '' : 's'} due for review.`)
    markShownToday('due-words', now)
    return
  }

  if (!isDailyChallengeDoneToday(now)) {
    notify('Daily Challenge available', `Complete today's challenge for +${DAILY_CHALLENGE_BONUS_XP} bonus XP.`)
    markShownToday('daily-challenge', now)
    return
  }

  const dailyXp = getDailyXp(now)
  if (dailyXp < DAILY_XP_GOAL) {
    notify('Keep learning!', `You're at ${dailyXp}/${DAILY_XP_GOAL} XP for today.`)
    markShownToday('daily-goal', now)
  }
}
