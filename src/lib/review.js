import { UNITS } from '../data/units'

// Review sessions favor recognition-style exercises (flashcard/multipleChoice)
// over ones that need exact typing/ordering out of the unit's original
// context (fillBlank/sentenceBuilder), since those read oddly outside the
// sentence they were written for.
const PREFERRED_TYPES = ['flashcard', 'multipleChoice']

function findExercisesForWord(wordId) {
  const found = []
  for (const unit of UNITS) {
    for (const exercise of unit.exercises) {
      if (exercise.wordId === wordId) found.push(exercise)
    }
  }
  return found
}

// Resolves a list of word ids (e.g. from getDueWordIds) back to one exercise
// per word, pulled from wherever that word was originally taught, for
// feeding into ExerciseRunner.
export function buildReviewExercises(wordIds) {
  const exercises = []
  for (const wordId of wordIds) {
    const candidates = findExercisesForWord(wordId)
    if (candidates.length === 0) continue
    exercises.push(candidates.find((ex) => PREFERRED_TYPES.includes(ex.type)) ?? candidates[0])
  }
  return exercises
}
