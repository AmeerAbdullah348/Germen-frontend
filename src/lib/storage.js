// Thin localStorage wrapper that degrades gracefully in private/incognito
// browsing modes where localStorage can throw or silently no-op.

const memoryFallback = new Map()
let warnedOnce = false

function storageAvailable() {
  try {
    const testKey = '__gla_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const hasStorage = storageAvailable()

function warnOnce() {
  if (!warnedOnce) {
    warnedOnce = true
    console.warn(
      'German Learning App: persistent storage is unavailable (private/incognito mode?). Progress will not be saved after this session.'
    )
  }
}

export function readJSON(key, fallback) {
  if (!hasStorage) {
    warnOnce()
    return memoryFallback.has(key) ? memoryFallback.get(key) : fallback
  }
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  if (!hasStorage) {
    warnOnce()
    memoryFallback.set(key, value)
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or blocked mid-session — fall back silently for this write.
    memoryFallback.set(key, value)
  }
}

export const isPersistent = hasStorage
