import { useMemo } from 'react'
import ExerciseRunner from '../components/ExerciseRunner'
import { useAuth } from '../lib/AuthContext'
import { getFavoriteIds } from '../lib/favorites'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'
import { getAllVocab } from '../lib/vocabulary'

export default function FavoritesPractice() {
  const { user } = useAuth()

  const exercises = useMemo(() => {
    const ids = new Set(getFavoriteIds())
    return getAllVocab()
      .filter((word) => ids.has(word.id))
      .map((word) => ({ type: 'flashcard', wordId: word.id, front: word.de, back: word.en }))
  }, [])

  function handleResult(exercise, isCorrect) {
    recordAnswer(exercise.wordId, isCorrect)
    if (!isCorrect) {
      recordMistake({
        itemType: 'vocab',
        itemId: exercise.wordId,
        unitOrTopicId: null,
        userAnswer: null,
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
      exitTo="/favorites"
      finishedTitle="Favorites practice complete! 🎉"
      backLabel="Back to Favorites"
    />
  )
}
