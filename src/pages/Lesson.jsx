import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Flashcard from '../components/lesson/Flashcard'
import FillBlank from '../components/lesson/FillBlank'
import MultipleChoice from '../components/lesson/MultipleChoice'
import Pronunciation from '../components/lesson/Pronunciation'
import SentenceBuilder from '../components/lesson/SentenceBuilder'
import { UNITS_BY_ID } from '../data/units'
import { useAuth } from '../lib/AuthContext'
import { bumpStreak, recordAnswer } from '../lib/progress'
import { flushPendingSync } from '../lib/remoteSync'

const EXERCISE_COMPONENTS = {
  flashcard: Flashcard,
  multipleChoice: MultipleChoice,
  fillBlank: FillBlank,
  sentenceBuilder: SentenceBuilder,
  pronunciation: Pronunciation,
}

export default function Lesson() {
  const { unitId } = useParams()
  const { user } = useAuth()
  const unit = UNITS_BY_ID[unitId]
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)

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

  const exercise = unit.exercises[index]
  const progressPct = Math.round((index / unit.exercises.length) * 100)

  function handleResult(isCorrect) {
    // Local write is synchronous and always succeeds — the UI never waits on
    // the network. The Supabase push below is fire-and-forget; if it fails
    // (offline), progress.js already queued it for retry (see remoteSync.js).
    recordAnswer(exercise.wordId, isCorrect)
    setScore((s) => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }))

    if (index + 1 < unit.exercises.length) {
      setIndex((i) => i + 1)
    } else {
      bumpStreak()
      setFinished(true)
    }

    flushPendingSync(user?.id)
  }

  if (finished) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 px-6 text-center mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900">Lesson complete! 🎉</h1>
        <p className="text-gray-600">
          You got <span className="font-semibold text-success">{score.correct}</span> out of{' '}
          {score.total} correct.
        </p>
        <Link
          to="/"
          className="rounded-xl bg-primary-600 text-white py-3 px-8 font-medium mt-2"
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type]

  return (
    <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="text-gray-400 text-xl leading-none">
          &times;
        </Link>
        <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {ExerciseComponent ? (
          <ExerciseComponent key={index} exercise={exercise} onResult={handleResult} />
        ) : (
          <p className="text-gray-500">Unsupported exercise type: {exercise.type}</p>
        )}
      </div>
    </div>
  )
}
