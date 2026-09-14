import { useMemo } from 'react'
import ExerciseRunner from '../components/ExerciseRunner'
import { UNITS } from '../data/units'
import { useAuth } from '../lib/AuthContext'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, getDueWordIds, recordAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'
import { buildReviewExercises } from '../lib/review'

export default function ReviewSession() {
  const { user } = useAuth()

  const exercises = useMemo(() => {
    const allWordIds = UNITS.flatMap((unit) => unit.vocab.map((word) => word.id))
    return buildReviewExercises(getDueWordIds(allWordIds))
  }, [])

  function handleResult(exercise, isCorrect, userAnswer) {
    recordAnswer(exercise.wordId, isCorrect)
    if (!isCorrect) {
      recordMistake({
        itemType: 'vocab',
        itemId: exercise.wordId,
        unitOrTopicId: null,
        userAnswer: userAnswer ?? null,
        correctAnswer: getCorrectAnswerText(exercise),
      })
    }
    flushPendingSync(user?.id)
  }

  function handleFinish() {
    bumpStreak()
    flushPendingSync(user?.id)
  }

  return (
    <ExerciseRunner
      exercises={exercises}
      onResult={handleResult}
      onFinish={handleFinish}
      exitTo="/review"
      finishedTitle="Review complete! 🎉"
      backLabel="Back to Review Center"
    />
  )
}
