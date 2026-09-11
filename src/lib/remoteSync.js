import { clearProfileDirty, clearWordDirty, getPendingSync, getState, overwriteState } from './progress'
import { isSupabaseConfigured, supabase } from './supabaseClient'

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
}

// Pulls the authoritative copy down from Supabase into the local cache.
// Flushes any pending local writes first so a device coming back online
// doesn't clobber its own not-yet-synced changes.
export async function hydrateFromRemote(userId) {
  if (!isSupabaseConfigured || !userId) return

  await flushPendingSync(userId)

  const [{ data: profile }, { data: wordRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('word_progress').select('*').eq('user_id', userId),
  ])

  const words = {}
  for (const row of wordRows ?? []) {
    words[row.word_id] = fromRemoteWordRow(row)
  }

  overwriteState({
    name: profile?.name ?? 'Learner',
    xp: profile?.xp ?? 0,
    streak: { count: profile?.streak_count ?? 0, lastActiveDay: profile?.last_active_day ?? null },
    words,
  })
}
