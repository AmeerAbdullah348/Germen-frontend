import { clearFavoriteDirty, getPendingFavorites, overwriteFavorites } from './favorites'
import { clearPendingMistakes, getPendingMistakeCount, getRecentMistakes } from './mistakes'
import { clearItemDirty, clearProfileDirty, clearWordDirty, getPendingSync, getState, overwriteState } from './progress'
import { isSupabaseConfigured, supabase } from './supabaseClient'

function toRemoteMistakeRow(userId, mistake) {
  return {
    user_id: userId,
    item_type: mistake.itemType,
    item_id: mistake.itemId,
    unit_or_topic_id: mistake.unitOrTopicId,
    user_answer: mistake.userAnswer,
    correct_answer: mistake.correctAnswer,
  }
}

function toRemoteWordRow(userId, wordId, card) {
  return {
    user_id: userId,
    word_id: wordId,
    repetitions: card.repetitions,
    ease_factor: card.easeFactor,
    interval_days: card.intervalDays,
    due_date: card.dueDate,
    last_result: card.lastResult ?? null,
  }
}

function fromRemoteWordRow(row) {
  return {
    repetitions: row.repetitions,
    easeFactor: Number(row.ease_factor),
    intervalDays: row.interval_days,
    dueDate: row.due_date,
    lastResult: row.last_result,
  }
}

function toRemoteItemRow(userId, itemType, itemId, card) {
  return {
    user_id: userId,
    item_type: itemType,
    item_id: itemId,
    repetitions: card.repetitions,
    ease_factor: card.easeFactor,
    interval_days: card.intervalDays,
    due_date: card.dueDate,
    last_result: card.lastResult ?? null,
  }
}

function fromRemoteItemRow(row) {
  return {
    repetitions: row.repetitions,
    easeFactor: Number(row.ease_factor),
    intervalDays: row.interval_days,
    dueDate: row.due_date,
    lastResult: row.last_result,
  }
}

// Pushes anything recorded locally while offline (or while a write failed)
// up to Supabase. Safe to call often — it's a no-op once everything is synced.
export async function flushPendingSync(userId) {
  if (!isSupabaseConfigured || !userId) return

  const pending = getPendingSync()

  if (pending.profileDirty) {
    const state = getState()
    const { error } = await supabase
      .from('profiles')
      .update({
        name: state.name,
        xp: state.xp,
        streak_count: state.streak.count,
        last_active_day: state.streak.lastActiveDay,
      })
      .eq('id', userId)
    if (!error) clearProfileDirty()
  }

  for (const wordId of pending.wordIds) {
    const state = getState()
    const card = state.words[wordId]
    if (!card) {
      clearWordDirty(wordId)
      continue
    }
    const { error } = await supabase.from('word_progress').upsert(toRemoteWordRow(userId, wordId, card))
    if (!error) clearWordDirty(wordId)
  }

  for (const { itemType, itemId } of pending.items) {
    const state = getState()
    const card = state.items?.[`${itemType}:${itemId}`]
    if (!card) {
      clearItemDirty(itemType, itemId)
      continue
    }
    const { error } = await supabase
      .from('item_progress')
      .upsert(toRemoteItemRow(userId, itemType, itemId, card))
    if (!error) clearItemDirty(itemType, itemId)
  }

  // Mistakes are an append-only log (not "current state"), so instead of a
  // per-row dirty list, we just track how many of the newest local entries
  // haven't been pushed yet and insert that slice.
  const pendingMistakeCount = getPendingMistakeCount()
  if (pendingMistakeCount > 0) {
    const unsynced = getRecentMistakes(null, pendingMistakeCount)
    const { error } = await supabase.from('mistakes').insert(unsynced.map((m) => toRemoteMistakeRow(userId, m)))
    if (!error) clearPendingMistakes()
  }

  const pendingFavorites = getPendingFavorites()
  for (const [wordId, action] of Object.entries(pendingFavorites)) {
    const { error } =
      action === 'add'
        ? await supabase.from('favorites').upsert({ user_id: userId, word_id: wordId })
        : await supabase.from('favorites').delete().eq('user_id', userId).eq('word_id', wordId)
    if (!error) clearFavoriteDirty(wordId)
  }
}

// Placement results are a low-frequency, historical log (one row per
// attempt) — unlike words/items/mistakes there's no offline retry queue for
// this; the local placementLevel (progress.js) already took effect
// immediately and is durable on this device regardless of whether this push
// succeeds. This call is fire-and-forget so it never blocks the results screen.
export async function savePlacementResult(userId, estimatedLevel, rawScores) {
  if (!isSupabaseConfigured || !userId) return
  await supabase.from('placement_results').insert({
    user_id: userId,
    estimated_level: estimatedLevel,
    raw_scores: rawScores,
  })
}

// Fetched lazily by the Mistakes page (not during login hydration, unlike
// words/items/profile) — this is a log a user browses, not current state
// that needs to be ready before the rest of the app can render.
export async function fetchRemoteMistakes(userId, limit = 100) {
  if (!isSupabaseConfigured || !userId) return []

  const { data, error } = await supabase
    .from('mistakes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return []

  return data.map((row) => ({
    itemType: row.item_type,
    itemId: row.item_id,
    unitOrTopicId: row.unit_or_topic_id,
    userAnswer: row.user_answer,
    correctAnswer: row.correct_answer,
    createdAt: row.created_at,
  }))
}

// Pulls the authoritative copy down from Supabase into the local cache.
// Flushes any pending local writes first so a device coming back online
// doesn't clobber its own not-yet-synced changes.
//
// Each query's result is only applied if that query actually succeeded — a
// failed query (offline, RLS misconfigured, or a table that doesn't exist
// yet on this Supabase project) falls back to the current local value
// instead of silently overwriting it with an empty result. Without this,
// any transient fetch failure would wipe locally-tracked progress.
export async function hydrateFromRemote(userId) {
  if (!isSupabaseConfigured || !userId) return

  await flushPendingSync(userId)

  const current = getState()

  const [profileRes, wordRes, itemRes, favoriteRes, placementRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('word_progress').select('*').eq('user_id', userId),
    supabase.from('item_progress').select('*').eq('user_id', userId),
    supabase.from('favorites').select('word_id').eq('user_id', userId),
    supabase
      .from('placement_results')
      .select('estimated_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const words = wordRes.error
    ? current.words
    : Object.fromEntries((wordRes.data ?? []).map((row) => [row.word_id, fromRemoteWordRow(row)]))

  const items = itemRes.error
    ? current.items
    : Object.fromEntries(
        (itemRes.data ?? []).map((row) => [`${row.item_type}:${row.item_id}`, fromRemoteItemRow(row)])
      )

  const placementLevel = placementRes.error
    ? current.placementLevel
    : (placementRes.data?.estimated_level ?? current.placementLevel)

  overwriteState({
    name: profileRes.error ? current.name : (profileRes.data?.name ?? current.name),
    xp: profileRes.error ? current.xp : (profileRes.data?.xp ?? current.xp),
    streak: profileRes.error
      ? current.streak
      : { count: profileRes.data?.streak_count ?? 0, lastActiveDay: profileRes.data?.last_active_day ?? null },
    words,
    items,
    placementLevel,
  })

  if (!favoriteRes.error) {
    overwriteFavorites((favoriteRes.data ?? []).map((row) => row.word_id))
  }
}
