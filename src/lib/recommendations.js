import { GRAMMAR_TOPICS } from '../data/grammar'
import { LISTENING_LESSONS } from '../data/listening'
import { SPEAKING_TOPICS } from '../data/speaking'
import { UNITS } from '../data/units'
import { WRITING_TOPICS } from '../data/writing'
import { getDueWordIds, getState, isUnitComplete } from './progress'

// Deterministic, data-driven "what to practice next" — no AI. Reuses the
// same item_progress state every other Phase-2/3 feature already writes to,
// so this is pure read-side analysis over data that already exists.
const SKILL_SOURCES = {
  grammar: { topics: GRAMMAR_TOPICS, label: 'Grammar', to: '/grammar' },
  listening: { topics: LISTENING_LESSONS, label: 'Listening', to: '/listening' },
  speaking: { topics: SPEAKING_TOPICS, label: 'Speaking', to: '/speaking' },
  writing: { topics: WRITING_TOPICS, label: 'Writing', to: '/writing' },
}

// Below this many attempts, accuracy is too noisy to act on (e.g. 1/1 wrong
// shouldn't trigger "you're weak at Writing").
const MIN_ATTEMPTS_FOR_SIGNAL = 4
const WEAK_ACCURACY_THRESHOLD = 0.7

function scoreExercises(itemType, exercises, state) {
  let correct = 0
  let total = 0
  for (const exercise of exercises) {
    const card = state.items?.[`${itemType}:${exercise.itemId}`]
    if (card) {
      total++
      if (card.lastResult === 'correct') correct++
    }
  }
  return { attempted: total, accuracy: total > 0 ? correct / total : null }
}

function allExercises(topics) {
  return topics.flatMap((topic) => topic.exercises)
}

function shortTitle(title) {
  return title.split(/\s+[—-]\s+/)[0]
}

// Returns up to 3 concrete, prioritized recommendations: due vocabulary
// first (most time-sensitive), then the weakest skill with enough signal to
// act on (drilling into the specific weak grammar topic when applicable),
// then a completely untried skill, then the next incomplete unit.
export function getRecommendations(now = new Date(), state = getState()) {
  const recs = []

  const allWordIds = UNITS.flatMap((unit) => unit.vocab.map((word) => word.id))
  const dueCount = getDueWordIds(allWordIds, now).length
  if (dueCount > 0) {
    recs.push({ id: 'due-words', label: `Review ${dueCount} due word${dueCount === 1 ? '' : 's'}`, to: '/review' })
  }

  const skillScores = Object.entries(SKILL_SOURCES).map(([type, { topics, label, to }]) => ({
    type,
    label,
    to,
    topics,
    ...scoreExercises(type, allExercises(topics), state),
  }))

  const withSignal = skillScores.filter((s) => s.attempted >= MIN_ATTEMPTS_FOR_SIGNAL)
  if (withSignal.length > 0) {
    const weakest = withSignal.reduce((a, b) => (a.accuracy < b.accuracy ? a : b))
    if (weakest.accuracy < WEAK_ACCURACY_THRESHOLD) {
      if (weakest.type === 'grammar') {
        const topicScores = weakest.topics
          .map((topic) => ({ topic, ...scoreExercises('grammar', topic.exercises, state) }))
          .filter((t) => t.attempted > 0)
        const weakestTopic =
          topicScores.length > 0 ? topicScores.reduce((a, b) => (a.accuracy < b.accuracy ? a : b)) : null
        recs.push(
          weakestTopic
            ? {
                id: `weak-grammar-${weakestTopic.topic.id}`,
                label: `Practice ${shortTitle(weakestTopic.topic.title)}`,
                to: `/grammar/${weakestTopic.topic.id}`,
              }
            : { id: 'weak-grammar', label: 'Improve Grammar', to: '/grammar' }
        )
      } else {
        recs.push({ id: `weak-${weakest.type}`, label: `Improve ${weakest.label}`, to: weakest.to })
      }
    }
  }

  if (recs.length < 3) {
    const untried = skillScores.find((s) => s.attempted === 0)
    if (untried) recs.push({ id: `try-${untried.type}`, label: `Try ${untried.label}`, to: untried.to })
  }

  if (recs.length < 3) {
    const nextUnit = UNITS.find((unit) => !isUnitComplete(unit, state))
    if (nextUnit) recs.push({ id: 'next-unit', label: `Continue: ${nextUnit.title}`, to: `/lesson/${nextUnit.id}` })
  }

  return recs.slice(0, 3)
}
