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
export async function hydrateFromRemote(userId) {
  if (!isSupabaseConfigured || !userId) return

  await flushPendingSync(userId)

  const [{ data: profile }, { data: wordRows }, { data: itemRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('word_progress').select('*').eq('user_id', userId),
    supabase.from('item_progress').select('*').eq('user_id', userId),
  ])

  const words = {}
  for (const row of wordRows ?? []) {
    words[row.word_id] = fromRemoteWordRow(row)
  }

  const items = {}
  for (const row of itemRows ?? []) {
    items[`${row.item_type}:${row.item_id}`] = fromRemoteItemRow(row)
  }

  overwriteState({
    name: profile?.name ?? 'Learner',
    xp: profile?.xp ?? 0,
    streak: { count: profile?.streak_count ?? 0, lastActiveDay: profile?.last_active_day ?? null },
    words,
    items,
  })
}
