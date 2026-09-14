import { GRAMMAR_TOPICS } from '../data/grammar'
import { LISTENING_LESSONS } from '../data/listening'
import { UNITS } from '../data/units'
import { WRITING_TOPICS } from '../data/writing'
import { todayKey } from './dateKeys'
import { getDueWordIds } from './progress'
import { buildReviewExercises } from './review'
import { readJSON, writeJSON } from './storage'

export const DAILY_CHALLENGE_BONUS_XP = 30

const KEY = 'gla:dailyChallenge'

export function isDailyChallengeDoneToday(now = new Date()) {
  const rec = readJSON(KEY, { date: null })
  return rec.date === todayKey(now)
}

export function markDailyChallengeDone(now = new Date()) {
  writeJSON(KEY, { date: todayKey(now) })
}

// Deterministic day-of-year index so the challenge is stable all day but
// rotates daily, without needing real randomness.
function dayIndex(now) {
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now - start) / 86400000)
}

function pickDaily(pool, idx, count) {
  if (pool.length === 0) return []
  const picks = []
  for (let i = 0; i < count && i < pool.length; i++) {
    picks.push(pool[(idx + i) % pool.length])
  }
  return picks
}

// A short mixed session: a few due vocab words plus one exercise each from
// grammar/listening/writing, so completing it touches multiple skills in
// one sitting. Exercises from non-vocab pools are tagged with `contentType`
// so the runner knows which item_progress namespace to record into.
export function buildDailyChallenge(now = new Date()) {
  const idx = dayIndex(now)
  const exercises = []

  const allWordIds = UNITS.flatMap((unit) => unit.vocab.map((word) => word.id))
  const dueWordIds = getDueWordIds(allWordIds, now).slice(0, 3)
  exercises.push(...buildReviewExercises(dueWordIds))

  const grammarPool = GRAMMAR_TOPICS.flatMap((topic) => topic.exercises)
  exercises.push(...pickDaily(grammarPool, idx, 1).map((ex) => ({ ...ex, contentType: 'grammar' })))

  const listeningPool = LISTENING_LESSONS.flatMap((lesson) => lesson.exercises)
  exercises.push(...pickDaily(listeningPool, idx, 1).map((ex) => ({ ...ex, contentType: 'listening' })))

  const writingPool = WRITING_TOPICS.flatMap((topic) => topic.exercises)
  exercises.push(...pickDaily(writingPool, idx, 1).map((ex) => ({ ...ex, contentType: 'writing' })))

  return exercises
}
