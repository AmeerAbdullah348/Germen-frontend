import { Link, useParams } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import { UNITS_BY_ID } from '../data/units'
import { useAuth } from '../lib/AuthContext'
import { logActivity } from '../lib/activity'
import { getCorrectAnswerText, recordMistake } from '../lib/mistakes'
import { bumpStreak, recordAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'

export default function Lesson() {
  const { unitId } = useParams()
  const { user } = useAuth()
  const unit = UNITS_BY_ID[unitId]

  if (!unit) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">This lesson couldn't be loaded.</p>
        <Link to="/" className="text-primary-600 font-medium">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  function handleResult(exercise, isCorrect, userAnswer) {
    // Local write is synchronous and always succeeds — the UI never waits on
    // the network. The Supabase push below is fire-and-forget; if it fails
    // (offline), progress.js already queued it for retry (see remoteSync.js).
    recordAnswer(exercise.wordId, isCorrect)
    if (!isCorrect) {
      recordMistake({
        itemType: 'vocab',
        itemId: exercise.wordId,
        unitOrTopicId: unit.id,
        userAnswer: userAnswer ?? null,
        correctAnswer: getCorrectAnswerText(exercise),
      })
    }
    flushPendingSync(user?.id)
  }

  function handleFinish() {
    bumpStreak()
    logActivity('lesson_completed')
    flushPendingSync(user?.id)
  }

  return <ExerciseRunner exercises={unit.exercises} onResult={handleResult} onFinish={handleFinish} exitTo="/" />
}
