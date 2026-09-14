import { isDue } from './srs'

const DAY_MS = 24 * 60 * 60 * 1000

// How far past its due date a card has to be before it's "overdue" rather
// than just "due" — a card due yesterday isn't meaningfully behind yet.
const OVERDUE_GRACE_DAYS = 3
// Ease factor starts at 2.5 (see srs.js); a card that's dropped noticeably
// below that, or whose last attempt was wrong, is flagged "weak".
const WEAK_EASE_THRESHOLD = 2.0
// A card reviewed this recently (and not yet due again) counts as
// "recently learned" for the Review Center's Recent tab.
const RECENT_DAYS = 3
// Matches the existing Profile.jsx mastery threshold (repetitions >= 3).
const MASTERED_REPETITIONS = 3

// Four-bucket label used by Profile's mastery chart/word list — unchanged
// from the logic that used to live inline in Profile.jsx.
export function getMasteryLabel(card) {
  if (!card) return 'New'
  if (card.repetitions === 0) return 'Learning'
  if (card.repetitions < 3) return 'Familiar'
  return 'Mastered'
}

// Single-status classification used by the Review Center's five tabs
// (due/overdue/weak/recent/mastered). Never-studied cards count as "due",
// matching getDueWordIds' existing treatment of missing cards.
export function getCardStatus(card, now = new Date()) {
  if (!card) return 'due'

  const weak = card.lastResult === 'incorrect' || card.easeFactor < WEAK_EASE_THRESHOLD
  const nowMs = new Date(now).getTime()
  const dueMs = new Date(card.dueDate).getTime()
  const due = isDue(card, now)

  if (due) {
    if (weak) return 'weak'
    const daysOverdue = (nowMs - dueMs) / DAY_MS
    return daysOverdue > OVERDUE_GRACE_DAYS ? 'overdue' : 'due'
  }

  if (weak) return 'weak'

  // dueDate = last-reviewed + intervalDays (see srs.js reviewCard), so this
  // recovers an approximate last-reviewed timestamp without a new field.
  const reviewedAtMs = dueMs - card.intervalDays * DAY_MS
  const daysSinceReview = (nowMs - reviewedAtMs) / DAY_MS
  if (daysSinceReview <= RECENT_DAYS) return 'recent'

  return card.repetitions >= MASTERED_REPETITIONS ? 'mastered' : 'learning'
}

const REVIEW_BUCKETS = ['due', 'overdue', 'weak', 'recent', 'mastered']

function groupByStatus(ids, getCard, now) {
  const groups = Object.fromEntries(REVIEW_BUCKETS.map((b) => [b, []]))
  for (const id of ids) {
    const status = getCardStatus(getCard(id), now)
    if (groups[status]) groups[status].push(id)
  }
  return groups
}

export function groupWordsByStatus(wordIds, state, now = new Date()) {
  return groupByStatus(wordIds, (id) => state.words[id], now)
}

export function groupItemsByStatus(itemType, itemIds, state, now = new Date()) {
  return groupByStatus(itemIds, (id) => state.items?.[`${itemType}:${id}`], now)
}
