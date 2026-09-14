import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import { useAuth } from '../lib/AuthContext'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'
import { groupVocabByCategory } from '../lib/vocabulary'

export default function VocabularyPractice() {
  const { category } = useParams()
  const decoded = decodeURIComponent(category)
  const { user } = useAuth()

  const exercises = useMemo(() => {
    const words = groupVocabByCategory()[decoded] ?? []
    return words.map((word) => ({ type: 'flashcard', wordId: word.id, front: word.de, back: word.en }))
  }, [decoded])

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
      exitTo={`/vocabulary/${category}`}
      finishedTitle="Category practice complete! 🎉"
      backLabel="Back to Category"
    />
  )
}
