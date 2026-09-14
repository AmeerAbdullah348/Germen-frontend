import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ExerciseRunner from '../components/ExerciseRunner'
import Button from '../components/ui/Button'
import { PLACEMENT_QUESTIONS } from '../data/placement'
import { useAuth } from '../lib/AuthContext'
import { LEVEL_LABELS } from '../lib/levels'
import { estimateLevel, summarizeBySection } from '../lib/placement'
import { setPlacementLevel } from '../lib/progress'
import { savePlacementResult } from '../lib/remoteSync'

const SECTION_LABELS = {
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  reading: 'Reading',
  listening: 'Listening',
}

export default function PlacementTest() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [started, setStarted] = useState(false)
  const answersRef = useRef([])

  function handleResult(exercise, isCorrect) {
    answersRef.current.push({ section: exercise.section, level: exercise.level, isCorrect })
  }

  function handleFinish() {
    const { estimate } = estimateLevel(answersRef.current)
    setPlacementLevel(estimate)
    savePlacementResult(user?.id, estimate, { answers: answersRef.current })
  }

  if (!started) {
    return (
      <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10">
        <Link to="/" className="text-gray-400 text-xl leading-none mb-8">
          &times;
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Placement Test</h1>
          <p className="text-gray-600">
            16 quick questions across vocabulary, grammar, reading, and listening. Takes about 5 minutes and
            estimates your CEFR level so you can start in the right place.
          </p>
          <p className="text-sm text-gray-400">This won't affect or reset any progress you've already made.</p>
          <Button className="px-8 mt-2" onClick={() => setStarted(true)}>
            Start Test
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ExerciseRunner
      exercises={PLACEMENT_QUESTIONS}
      onResult={handleResult}
      onFinish={handleFinish}
      exitTo="/"
      renderFinished={() => {
        const { estimate } = estimateLevel(answersRef.current)
        const bySection = summarizeBySection(answersRef.current)
        return (
          <div className="min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center mx-auto max-w-md">
            <div>
              <p className="text-sm text-gray-500">Your estimated level</p>
              <h1 className="text-4xl font-semibold text-primary-600 mt-1">{estimate}</h1>
              <p className="text-gray-500">{LEVEL_LABELS[estimate]}</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              {Object.entries(bySection).map(([section, { correct, total }]) => (
                <div
                  key={section}
                  className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
                >
                  <span className="text-gray-700">{SECTION_LABELS[section] ?? section}</span>
                  <span className="text-sm text-gray-500">
                    {correct}/{total}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              A1{estimate !== 'A1' ? ', A2' : ''}
              {estimate === 'B1' ? ', and B1' : ''} content is now unlocked on your Dashboard and in Grammar.
            </p>

            <Button className="px-8" onClick={() => navigate('/')}>
              Go to Dashboard
            </Button>
          </div>
        )
      }}
    />
  )
}
