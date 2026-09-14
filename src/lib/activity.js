import { todayKey, weekKey } from './dateKeys'
import { readJSON, writeJSON } from './storage'

// Daily/weekly per-type activity counters, used by missions.js. Deliberately
// standalone (doesn't import progress.js) so progress.js can call logActivity
// from inside recordAnswer/recordItemAnswer/bumpStreak without a circular
// import. Local-only, same as the rest of the gamification-adjacent state.
const DAILY_KEY = 'gla:activityDaily'
const WEEKLY_KEY = 'gla:activityWeekly'
// Caps how many past days/weeks of counters we keep, so this can't grow
// unbounded on a long-lived account.
const MAX_DAILY_PERIODS = 14
const MAX_WEEKLY_PERIODS = 8

function bump(storageKey, periodKey, type, maxPeriods) {
  const all = readJSON(storageKey, {})
  if (!all[periodKey]) all[periodKey] = {}
  all[periodKey][type] = (all[periodKey][type] || 0) + 1

  const keys = Object.keys(all)
  if (keys.length > maxPeriods) {
    for (const staleKey of keys.sort().slice(0, keys.length - maxPeriods)) {
      delete all[staleKey]
    }
  }
  writeJSON(storageKey, all)
}

export function logActivity(type, now = new Date()) {
  bump(DAILY_KEY, todayKey(now), type, MAX_DAILY_PERIODS)
  bump(WEEKLY_KEY, weekKey(now), type, MAX_WEEKLY_PERIODS)
}

export function getDailyActivity(now = new Date()) {
  const all = readJSON(DAILY_KEY, {})
  return all[todayKey(now)] || {}
}

export function getWeeklyActivity(now = new Date()) {
  const all = readJSON(WEEKLY_KEY, {})
  return all[weekKey(now)] || {}
}
