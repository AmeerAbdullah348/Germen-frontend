import { todayKey, weekKey } from './dateKeys'
import { getDailyActivity, getWeeklyActivity } from './activity'
import { addBonusXp } from './progress'
import { readJSON, writeJSON } from './storage'

export const DAILY_MISSIONS = [
  { id: 'daily-vocab', label: 'Answer 10 vocabulary questions', type: 'vocab_answer', target: 10, xp: 20 },
  { id: 'daily-grammar', label: 'Complete a grammar exercise', type: 'grammar_answer', target: 1, xp: 15 },
  {
    id: 'daily-listen-speak',
    label: 'Practice listening or speaking',
    type: ['listening_answer', 'speaking_answer'],
    target: 1,
    xp: 15,
  },
  { id: 'daily-lesson', label: 'Finish a lesson', type: 'lesson_completed', target: 1, xp: 25 },
]

export const WEEKLY_MISSIONS = [
  { id: 'weekly-vocab', label: 'Answer 50 vocabulary questions', type: 'vocab_answer', target: 50, xp: 60 },
  { id: 'weekly-grammar', label: 'Complete 5 grammar exercises', type: 'grammar_answer', target: 5, xp: 50 },
  { id: 'weekly-active-days', label: 'Practice on 5 different days', type: 'day_active', target: 5, xp: 80 },
]

function countFor(types, counts) {
  const list = Array.isArray(types) ? types : [types]
  return list.reduce((sum, type) => sum + (counts[type] || 0), 0)
}

export function getMissionsWithProgress(period, now = new Date()) {
  const defs = period === 'daily' ? DAILY_MISSIONS : WEEKLY_MISSIONS
  const counts = period === 'daily' ? getDailyActivity(now) : getWeeklyActivity(now)
  const claimed = getClaimedIds(period, now)

  return defs.map((mission) => {
    const progress = Math.min(countFor(mission.type, counts), mission.target)
    return {
      ...mission,
      progress,
      complete: progress >= mission.target,
      claimed: claimed.includes(mission.id),
    }
  })
}

// --- Claiming (local-only — matches the daily-goal/activity precedent) ---
const CLAIMED_KEY = 'gla:claimedMissions'

function periodKey(period, now) {
  return period === 'daily' ? todayKey(now) : weekKey(now)
}

function getClaimedIds(period, now) {
  const all = readJSON(CLAIMED_KEY, {})
  return all[periodKey(period, now)] || []
}

// Awards the mission's bonus XP once. Returns false if already claimed or
// not yet complete, so callers can't double-award by calling this twice.
export function claimMission(missionId, period, now = new Date()) {
  const missions = getMissionsWithProgress(period, now)
  const mission = missions.find((m) => m.id === missionId)
  if (!mission || !mission.complete || mission.claimed) return false

  const all = readJSON(CLAIMED_KEY, {})
  const key = periodKey(period, now)
  all[key] = [...(all[key] || []), missionId]
  writeJSON(CLAIMED_KEY, all)

  addBonusXp(mission.xp, now)
  return true
}
