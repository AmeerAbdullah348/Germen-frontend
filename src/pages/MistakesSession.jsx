import { useLocation } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import { useAuth } from '../lib/AuthContext'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordAnswer, recordItemAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'

export default function MistakesSession() {
  const { user } = useAuth()
  const location = useLocation()
  const exercises = location.state?.exercises ?? []

  function handleResult(exercise, isCorrect, userAnswer) {
    if (exercise.wordId) {
      recordAnswer(exercise.wordId, isCorrect)
    } else if (exercise.itemId) {
      recordItemAnswer('grammar', exercise.itemId, isCorrect)
    }
    if (!isCorrect) {
      recordMistake({
        itemType: exercise.wordId ? 'vocab' : 'grammar',
        itemId: exercise.wordId ?? exercise.itemId,
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
      exitTo="/mistakes"
      finishedTitle="Practice complete! 🎉"
      backLabel="Back to Mistakes"
    />
  )
}
