import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/AuthContext'
import {
  buildDailyChallenge,
  DAILY_CHALLENGE_BONUS_XP,
  isDailyChallengeDoneToday,
  markDailyChallengeDone,
} from '../lib/dailyChallenge'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { addBonusXp, bumpStreak, recordAnswer, recordItemAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'

export default function DailyChallenge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const alreadyDone = isDailyChallengeDoneToday()
  const exercises = useMemo(() => buildDailyChallenge(), [])

  function handleResult(exercise, isCorrect, userAnswer) {
    if (exercise.wordId) {
      recordAnswer(exercise.wordId, isCorrect)
    } else if (exercise.contentType) {
      recordItemAnswer(exercise.contentType, exercise.itemId, isCorrect)
    }
    if (!isCorrect) {
      recordMistake({
        itemType: exercise.wordId ? 'vocab' : exercise.contentType,
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
    addBonusXp(DAILY_CHALLENGE_BONUS_XP)
    markDailyChallengeDone()
    flushPendingSync(user?.id)
  }

  if (alreadyDone && !started) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-2xl">🎉</p>
        <p className="text-gray-600">You've already completed today's challenge — come back tomorrow!</p>
        <Link to="/" className="text-primary-600 font-medium">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10">
        <Link to="/" className="text-gray-400 text-xl leading-none mb-8">
          &times;
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Daily Challenge</h1>
          <p className="text-gray-600">
            A short mix of vocabulary, grammar, listening, and writing — {exercises.length} questions today.
          </p>
          <p className="text-sm text-accent-600 font-medium">+{DAILY_CHALLENGE_BONUS_XP} bonus XP on completion</p>
          <Button className="px-8 mt-2" onClick={() => setStarted(true)}>
            Start Challenge
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ExerciseRunner
      exercises={exercises}
      onResult={handleResult}
      onFinish={handleFinish}
      exitTo="/"
      finishedTitle="Challenge complete! 🎉"
      backLabel="Back to Dashboard"
      renderFinished={({ correct, total }) => (
        <div className="min-h-svh flex flex-col items-center justify-center gap-4 px-6 text-center mx-auto max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900">Challenge complete! 🎉</h1>
          <p className="text-gray-600">
            You got <span className="font-semibold text-success">{correct}</span> out of {total} correct.
          </p>
          <p className="text-accent-600 font-medium">+{DAILY_CHALLENGE_BONUS_XP} bonus XP</p>
          <Button className="px-8 mt-2" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    />
  )
}
