import { Link, useParams } from 'react'
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
      <div className="px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-svh bg-[#070b19]">
        <p className="text-slate-400">This lesson couldn't be loaded.</p>
        <Link to="/" className="text-cyan-400 font-bold hover:underline">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  function handleResult(exercise, isCorrect, userAnswer) {
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
