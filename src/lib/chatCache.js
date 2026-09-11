import { readJSON, writeJSON } from './storage'

const KEY = 'gla:chatCache'
const MAX_ENTRIES = 100

function normalizeQuestion(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function getCachedAnswer(question) {
  const cache = readJSON(KEY, {})
  return cache[normalizeQuestion(question)] ?? null
}

export function setCachedAnswer(question, answer) {
  const cache = readJSON(KEY, {})
  const key = normalizeQuestion(question)
  if (!(key in cache) && Object.keys(cache).length >= MAX_ENTRIES) {
    const oldestKey = Object.keys(cache)[0]
    delete cache[oldestKey]
  }
  cache[key] = answer
  writeJSON(KEY, cache)
}
