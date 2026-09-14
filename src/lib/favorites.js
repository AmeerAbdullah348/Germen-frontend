import { readJSON, writeJSON } from './storage'

const KEY = 'gla:favorites'

function getSet() {
  return new Set(readJSON(KEY, []))
}

function saveSet(set) {
  writeJSON(KEY, [...set])
}

export function isFavorite(wordId) {
  return getSet().has(wordId)
}

export function getFavoriteIds() {
  return [...getSet()]
}

export function toggleFavorite(wordId) {
  const set = getSet()
  const nowFavorite = !set.has(wordId)
  if (nowFavorite) set.add(wordId)
  else set.delete(wordId)
  saveSet(set)
  markFavoriteDirty(wordId, nowFavorite)
  return nowFavorite
}

// Wholesale replace — used when pulling the authoritative set down from
// Supabase on login (mirrors progress.js's overwriteState).
export function overwriteFavorites(wordIds) {
  saveSet(new Set(wordIds))
}

// --- Pending-sync bookkeeping (mirrors progress.js's pattern) -----------
// { [wordId]: 'add' | 'remove' } — last toggle wins if a word is flipped
// twice before the next sync.
const PENDING_KEY = 'gla:pendingFavorites'

function getPending() {
  return readJSON(PENDING_KEY, {})
}

function markFavoriteDirty(wordId, isAdd) {
  const pending = getPending()
  pending[wordId] = isAdd ? 'add' : 'remove'
  writeJSON(PENDING_KEY, pending)
}

export function getPendingFavorites() {
  return getPending()
}

export function clearFavoriteDirty(wordId) {
  const pending = getPending()
  delete pending[wordId]
  writeJSON(PENDING_KEY, pending)
}
