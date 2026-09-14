import { GRAMMAR_TOPICS } from '../data/grammar'
import { LISTENING_LESSONS } from '../data/listening'
import { READING_PASSAGES } from '../data/reading'
import { SPEAKING_TOPICS } from '../data/speaking'
import { UNITS } from '../data/units'
import { WRITING_TOPICS } from '../data/writing'
import { isContentComplete } from './contentProgress'
import { todayKey } from './dateKeys'
import { isGrammarTopicComplete } from './grammar'
import { getMasteryLabel } from './mastery'
import { getState, getXpHistory } from './progress'

const SKILLS = {
  grammar: { topics: GRAMMAR_TOPICS, isComplete: isGrammarTopicComplete },
  listening: { topics: LISTENING_LESSONS, isComplete: (t, s) => isContentComplete(t, s, 'listening') },
  speaking: { topics: SPEAKING_TOPICS, isComplete: (t, s) => isContentComplete(t, s, 'speaking') },
  writing: { topics: WRITING_TOPICS, isComplete: (t, s) => isContentComplete(t, s, 'writing') },
  reading: { topics: READING_PASSAGES, isComplete: (t, s) => isContentComplete(t, s, 'reading') },
}

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
  return { attempted: total, correct }
}

function sumLastNDays(history, n, now) {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - n)
  return history.filter((entry) => new Date(entry.date) >= cutoff).reduce((sum, entry) => sum + entry.xp, 0)
}

export function getAnalytics(now = new Date(), state = getState()) {
  const allWords = UNITS.flatMap((unit) => unit.vocab)
  const vocabLearned = allWords.filter((word) => Boolean(state.words[word.id])).length
  const vocabMastered = allWords.filter((word) => getMasteryLabel(state.words[word.id]) === 'Mastered').length
  const vocabAttempted = vocabLearned
  const vocabCorrect = allWords.filter((word) => state.words[word.id]?.lastResult === 'correct').length

  const skillProgress = {}
  let overallCorrect = vocabCorrect
  let overallAttempted = vocabAttempted

  for (const [key, { topics, isComplete }] of Object.entries(SKILLS)) {
    const topicsComplete = topics.filter((topic) => isComplete(topic, state)).length
    const { attempted, correct } = scoreExercises(key, topics.flatMap((topic) => topic.exercises), state)
    skillProgress[key] = {
      topicsComplete,
      topicsTotal: topics.length,
      accuracy: attempted > 0 ? correct / attempted : null,
    }
    overallCorrect += correct
    overallAttempted += attempted
  }

  const history = getXpHistory()

  return {
    vocabLearned,
    vocabMastered,
    vocabTotal: allWords.length,
    skillProgress,
    overallAccuracy: overallAttempted > 0 ? overallCorrect / overallAttempted : null,
    currentStreak: state.streak.count,
    longestStreak: state.longestStreak || 0,
    sessionCount: state.sessionCount || 0,
    studyTimeMs: state.studyTimeMs || 0,
    weeklyXp: sumLastNDays(history, 7, now),
    monthlyXp: sumLastNDays(history, 30, now),
  }
}

export function getWeeklyChartData(now = new Date()) {
  const history = getXpHistory()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = todayKey(d)
    const entry = history.find((h) => h.date === key)
    days.push({ day: d.toLocaleDateString('en', { weekday: 'short' }), xp: entry?.xp ?? 0 })
  }
  return days
}

export function formatStudyTime(ms) {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes} min`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
