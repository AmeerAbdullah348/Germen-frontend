import { readJSON, writeJSON } from './storage'

const KEY = 'gla:mistakes'
const MAX_STORED = 200

function todayIso(now = new Date()) {
  return now.toISOString()
}

// Best-effort mapping from an exercise's shape to a human-readable "correct
// answer" string — reused by every content type that runs through
// ExerciseRunner (vocab, grammar, and later listening/writing).
export function getCorrectAnswerText(exercise) {
  switch (exercise.type) {
    case 'multipleChoice':
    case 'sentenceBuilder':
      return exercise.answer
    case 'fillBlank':
      return Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer
    case 'flashcard':
      return exercise.back
    case 'pronunciation':
      return exercise.target
    default:
      return exercise.answer ?? ''
  }
}

// Append-only local log of wrong answers, generic across content types
// (itemType: 'vocab' | 'grammar' | ...). This is a log, not "current state",
// so — unlike words/items — it's never merged/overwritten wholesale; it's
// just capped locally and pushed to Supabase best-effort.
export function recordMistake(
  { itemType, itemId, unitOrTopicId = null, userAnswer = null, correctAnswer },
  now = new Date()
) {
  const list = readJSON(KEY, [])
  list.unshift({
    itemType,
    itemId,
    unitOrTopicId,
    userAnswer,
    correctAnswer,
    createdAt: todayIso(now),
  })
  writeJSON(KEY, list.slice(0, MAX_STORED))
  markMistakeDirty()
}

export function getRecentMistakes(itemType = null, limit = MAX_STORED) {
  const list = readJSON(KEY, [])
  const filtered = itemType ? list.filter((m) => m.itemType === itemType) : list
  return filtered.slice(0, limit)
}

// --- Pending-sync bookkeeping (mirrors progress.js's pattern) -----------
const PENDING_KEY = 'gla:pendingMistakes'

function markMistakeDirty() {
  const pending = readJSON(PENDING_KEY, { count: 0 })
  writeJSON(PENDING_KEY, { count: pending.count + 1 })
}

export function getPendingMistakeCount() {
  return readJSON(PENDING_KEY, { count: 0 }).count
}

export function clearPendingMistakes() {
  writeJSON(PENDING_KEY, { count: 0 })
}
