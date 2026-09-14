import { GRAMMAR_TOPICS } from '../data/grammar'
import { UNITS } from '../data/units'
import { isGrammarTopicComplete } from './grammar'
import { getMasteryLabel } from './mastery'
import { getState, isUnitComplete } from './progress'
import { readJSON, writeJSON } from './storage'

function buildContext(state) {
  const allWords = UNITS.flatMap((unit) => unit.vocab)
  const wordsLearned = allWords.filter((word) => Boolean(state.words[word.id])).length
  const wordsMastered = allWords.filter((word) => getMasteryLabel(state.words[word.id]) === 'Mastered').length
  const grammarTopicsComplete = GRAMMAR_TOPICS.filter((topic) => isGrammarTopicComplete(topic, state)).length
  const a1Units = UNITS.filter((unit) => (unit.level || 'A1') === 'A1')
  const a1Complete = a1Units.length > 0 && a1Units.every((unit) => isUnitComplete(unit, state))

  return {
    state,
    sessionCount: state.sessionCount || 0,
    wordsLearned,
    wordsMastered,
    grammarTopicsComplete,
    hadPerfectSession: Boolean(state.hadPerfectSession),
    a1Complete,
  }
}

export const ACHIEVEMENTS = [
  {
    id: 'first-lesson',
    label: 'First Lesson',
    description: 'Complete your first lesson.',
    check: (ctx) => ctx.sessionCount >= 1,
  },
  {
    id: 'words-100',
    label: '100 Words Learned',
    description: 'Learn 100 vocabulary words.',
    check: (ctx) => ctx.wordsLearned >= 100,
  },
  {
    id: 'streak-7',
    label: '7-Day Streak',
    description: 'Maintain a 7-day streak.',
    check: (ctx) => ctx.state.streak.count >= 7,
  },
  {
    id: 'words-mastered-100',
    label: '100 Words Mastered',
    description: 'Master 100 vocabulary words.',
    check: (ctx) => ctx.wordsMastered >= 100,
  },
  {
    id: 'grammar-topic',
    label: 'Grammar Graduate',
    description: 'Complete a grammar topic.',
    check: (ctx) => ctx.grammarTopicsComplete >= 1,
  },
  {
    id: 'perfect-lesson',
    label: 'Perfect Score',
    description: 'Finish a lesson with a perfect score.',
    check: (ctx) => ctx.hadPerfectSession,
  },
  {
    id: 'level-a1',
    label: 'A1 Complete',
    description: 'Complete every A1 unit.',
    check: (ctx) => ctx.a1Complete,
  },
]

const KEY = 'gla:unlockedAchievements'

export function getUnlockedAchievementIds() {
  return readJSON(KEY, [])
}

// Wholesale replace — used when pulling the authoritative set down from
// Supabase on login (mirrors favorites.js's overwriteFavorites).
export function overwriteUnlockedAchievements(ids) {
  writeJSON(KEY, ids)
}

// --- Pending-sync bookkeeping ------------------------------------------
// Achievements only ever get added, never revoked, so this is a simple
// append-only pending list (unlike favorites' add/remove pending map).
const PENDING_KEY = 'gla:pendingAchievements'

function markAchievementDirty(id) {
  const pending = readJSON(PENDING_KEY, [])
  if (!pending.includes(id)) writeJSON(PENDING_KEY, [...pending, id])
}

export function getPendingAchievements() {
  return readJSON(PENDING_KEY, [])
}

export function clearAchievementDirty(id) {
  const pending = readJSON(PENDING_KEY, [])
  writeJSON(
    PENDING_KEY,
    pending.filter((p) => p !== id)
  )
}

// Evaluates every achievement against current progress and unlocks any newly
// earned ones. Called opportunistically (Dashboard mount, Achievements page
// mount) rather than after every single action, since achievements are
// derived from existing state rather than directly recorded.
export function checkAndUnlockAchievements() {
  const state = getState()
  const unlocked = new Set(getUnlockedAchievementIds())
  const ctx = buildContext(state)
  const newlyUnlocked = []

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && achievement.check(ctx)) {
      unlocked.add(achievement.id)
      newlyUnlocked.push(achievement)
      markAchievementDirty(achievement.id)
    }
  }

  if (newlyUnlocked.length > 0) overwriteUnlockedAchievements([...unlocked])
  return newlyUnlocked
}
