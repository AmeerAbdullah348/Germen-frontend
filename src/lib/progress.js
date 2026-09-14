import { logActivity } from './activity'
import { todayKey } from './dateKeys'
import { reviewCard, gradeToQuality, isDue } from './srs'
import { readJSON, writeJSON } from './storage'

const KEY = 'gla:progress'
const XP_PER_CORRECT = 10
const XP_PER_INCORRECT = 2
// Cap how many overdue cards surface in one sitting so a user returning after
// weeks away isn't buried under hundreds of "due" reviews at once.
const MAX_DUE_PER_SESSION = 20
// Below this many questions, a 100% score is too easy to be meaningful for
// the "perfect lesson" achievement (a 1-question session shouldn't count).
const MIN_EXERCISES_FOR_PERFECT = 3

function defaultState() {
  return {
    name: 'Learner',
    words: {}, // wordId -> SM-2 card
    items: {}, // "<itemType>:<itemId>" -> SM-2 card (grammar, listening, ...)
    xp: 0,
    streak: { count: 0, lastActiveDay: null },
    placementLevel: null, // CEFR code from the most recent placement test, if any
    // Local-only analytics (not synced — matches the existing daily-goal
    // precedent: motivational/informational, losing it on a new device is
    // harmless unlike real SM-2 progress).
    longestStreak: 0,
    studyTimeMs: 0,
    sessionCount: 0,
    hadPerfectSession: false,
  }
}

export function getState() {
  return readJSON(KEY, defaultState())
}

function saveState(state) {
  writeJSON(KEY, state)
}

// Replaces the local cache wholesale — used when pulling the authoritative
// copy down from Supabase on login.
export function overwriteState(newState) {
  saveState({ ...defaultState(), ...newState })
}

// --- Pending-sync bookkeeping ------------------------------------------
// Local writes always succeed immediately (so the UI never blocks on the
// network); if the Supabase write fails (offline, etc.) we remember what
// still needs pushing and retry later. See lib/remoteSync.js.
const PENDING_KEY = 'gla:pendingSync'

function getPending() {
  const pending = readJSON(PENDING_KEY, { profileDirty: false, wordIds: [], items: [] })
  // Backward-compatible: older cached pending state won't have `items` yet.
  return { items: [], ...pending }
}

function savePending(pending) {
  writeJSON(PENDING_KEY, pending)
}

function markWordDirty(wordId) {
  const pending = getPending()
  if (!pending.wordIds.includes(wordId)) pending.wordIds.push(wordId)
  savePending(pending)
}

function markItemDirty(itemType, itemId) {
  const pending = getPending()
  const key = `${itemType}:${itemId}`
  if (!pending.items.some((i) => `${i.itemType}:${i.itemId}` === key)) {
    pending.items.push({ itemType, itemId })
  }
  savePending(pending)
}

function markProfileDirty() {
  const pending = getPending()
  pending.profileDirty = true
  savePending(pending)
}

export function getPendingSync() {
  return getPending()
}

export function clearWordDirty(wordId) {
  const pending = getPending()
  savePending({ ...pending, wordIds: pending.wordIds.filter((id) => id !== wordId) })
}

export function clearItemDirty(itemType, itemId) {
  const pending = getPending()
  const key = `${itemType}:${itemId}`
  savePending({
    ...pending,
    items: pending.items.filter((i) => `${i.itemType}:${i.itemId}` !== key),
  })
}

export function clearProfileDirty() {
  savePending({ ...getPending(), profileDirty: false })
}

// Shared SM-2 review step — the one call site into srs.js used by both the
// vocab-word path (recordAnswer) and the generic item path
// (recordItemAnswer), so there's a single place that grades an answer.
function reviewAndGrade(cardsMap, id, isCorrect, now) {
  const quality = gradeToQuality(isCorrect)
  const prevCard = cardsMap[id]
  const nextCard = reviewCard(prevCard, quality, now)
  cardsMap[id] = { ...nextCard, lastResult: isCorrect ? 'correct' : 'incorrect' }
}

export function recordAnswer(wordId, isCorrect, now = new Date()) {
  const state = getState()
  reviewAndGrade(state.words, wordId, isCorrect, now)
  const xpGained = isCorrect ? XP_PER_CORRECT : XP_PER_INCORRECT
  state.xp += xpGained
  saveState(state)
  markWordDirty(wordId)
  markProfileDirty() // xp changed too
  addDailyXp(xpGained, now)
  logActivity('vocab_answer', now)
  return state
}

// Same SM-2 tracking as recordAnswer, generalized to any non-vocab content
// type (grammar, and later listening/reading/writing) via an item_type
// namespace so grammar/listening/etc. items never collide with each other
// or with vocab word ids.
export function recordItemAnswer(itemType, itemId, isCorrect, now = new Date()) {
  const state = getState()
  if (!state.items) state.items = {}
  reviewAndGrade(state.items, `${itemType}:${itemId}`, isCorrect, now)
  const xpGained = isCorrect ? XP_PER_CORRECT : XP_PER_INCORRECT
  state.xp += xpGained
  saveState(state)
  markItemDirty(itemType, itemId)
  markProfileDirty()
  addDailyXp(xpGained, now)
  logActivity(`${itemType}_answer`, now)
  return state
}

export function bumpStreak(now = new Date()) {
  const state = getState()
  const today = todayKey(now)
  const { lastActiveDay, count } = state.streak

  if (lastActiveDay === today) {
    return state // already counted today
  }

  const yesterday = todayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))
  const newCount = lastActiveDay === yesterday ? count + 1 : 1

  state.streak = { count: newCount, lastActiveDay: today }
  state.longestStreak = Math.max(state.longestStreak || 0, newCount)
  saveState(state)
  markProfileDirty()
  logActivity('day_active', now)
  return state
}

// Placement test result — a pure recommendation, never touches words/items,
// so retaking it can't destroy or reset any existing progress. Persisted
// locally immediately (so level-unlocking takes effect right away); the
// historical row in Supabase's placement_results table is pushed separately
// and best-effort (see remoteSync.js's savePlacementResult).
export function setPlacementLevel(level) {
  const state = getState()
  state.placementLevel = level
  saveState(state)
  return state
}

// Words never studied are always "due" (new); studied words are due per SM-2.
// Overdue backlog is capped so a returning user isn't shown 200 cards at once.
export function getDueWordIds(allWordIds, now = new Date()) {
  const state = getState()
  const due = allWordIds.filter((id) => isDue(state.words[id], now))
  return due.slice(0, MAX_DUE_PER_SESSION)
}

// Same as getDueWordIds, generalized to any item_type namespace.
export function getDueItemIds(itemType, allItemIds, now = new Date()) {
  const state = getState()
  const due = allItemIds.filter((id) => isDue(state.items?.[`${itemType}:${id}`], now))
  return due.slice(0, MAX_DUE_PER_SESSION)
}

// A unit is "complete" once every one of its words has been answered at
// least once — reuses the existing SM-2 word records instead of tracking a
// separate completion flag.
export function isUnitComplete(unit, state = getState()) {
  return unit.vocab.every((word) => Boolean(state.words[word.id]))
}

const XP_PER_LEVEL = 100

export function getLevel(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

// How far into the current level (0-100), for a "progress to next level" bar.
export function getXpIntoLevel(xp) {
  return xp % XP_PER_LEVEL
}

export const XP_PER_LEVEL_TOTAL = XP_PER_LEVEL

// --- Daily goal ----------------------------------------------------------
// A motivational, purely local metric (not synced to Supabase) — losing it
// on a new device is harmless, unlike real learning progress.
const DAILY_XP_KEY = 'gla:dailyXp'
export const DAILY_XP_GOAL = 50

export function getDailyXp(now = new Date()) {
  const rec = readJSON(DAILY_XP_KEY, { date: null, xp: 0 })
  return rec.date === todayKey(now) ? rec.xp : 0
}

function addDailyXp(amount, now = new Date()) {
  const today = todayKey(now)
  const current = getDailyXp(now)
  writeJSON(DAILY_XP_KEY, { date: today, xp: current + amount })
  addToXpHistory(today, amount)
}

// --- XP history (for weekly/monthly analytics) ---------------------------
// A rolling log of { date, xp } — local-only, same as the daily goal above.
// Capped so it can't grow unbounded on a long-lived account.
const XP_HISTORY_KEY = 'gla:xpHistory'
const XP_HISTORY_MAX_DAYS = 60

function addToXpHistory(dateKey, amount) {
  const history = readJSON(XP_HISTORY_KEY, [])
  const todayEntry = history.find((entry) => entry.date === dateKey)
  if (todayEntry) {
    todayEntry.xp += amount
  } else {
    history.push({ date: dateKey, xp: amount })
  }
  history.sort((a, b) => (a.date < b.date ? -1 : 1))
  writeJSON(XP_HISTORY_KEY, history.slice(-XP_HISTORY_MAX_DAYS))
}

export function getXpHistory() {
  return readJSON(XP_HISTORY_KEY, [])
}

// --- Bonus XP (missions/daily challenge rewards) --------------------------
// Same profile-sync path as recordAnswer's XP gain, but with no word/item
// attached — used for rewards that aren't tied to answering a specific question.
export function addBonusXp(amount, now = new Date()) {
  const state = getState()
  state.xp += amount
  saveState(state)
  markProfileDirty()
  addDailyXp(amount, now)
  return state
}

// --- Session tracking (study time, session count, perfect-session flag) --
// Called once by ExerciseRunner when any session finishes (unit lesson,
// grammar practice, review, daily challenge, ...) so every session type is
// covered from one call site instead of touching each page individually.
export function recordSession(durationMs, score, now = new Date()) {
  const state = getState()
  state.studyTimeMs = (state.studyTimeMs || 0) + Math.max(0, durationMs)
  state.sessionCount = (state.sessionCount || 0) + 1
  if (score && score.total >= MIN_EXERCISES_FOR_PERFECT && score.correct === score.total) {
    state.hadPerfectSession = true
  }
  saveState(state)
  logActivity('session_completed', now)
  return state
}
