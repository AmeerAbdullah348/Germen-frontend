import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'
import Flashcard from './lesson/Flashcard'
import FillBlank from './lesson/FillBlank'
import Listening from './lesson/Listening'
import MultipleChoice from './lesson/MultipleChoice'
import Pronunciation from './lesson/Pronunciation'
import SentenceBuilder from './lesson/SentenceBuilder'
import WritingPrompt from './lesson/WritingPrompt'

const EXERCISE_COMPONENTS = {
  flashcard: Flashcard,
  multipleChoice: MultipleChoice,
  fillBlank: FillBlank,
  sentenceBuilder: SentenceBuilder,
  pronunciation: Pronunciation,
  listening: Listening,
  writingPrompt: WritingPrompt,
}

// Content-agnostic exercise session runner — extracted from the original
// Lesson.jsx so Grammar/Review/Mistakes practice sessions can all reuse the
// same progress bar, scoring, and finished-screen logic instead of each
// re-implementing it. Callers own what "recording an answer" means for their
// content type (vocab word vs. grammar item) via `onResult`.
export default function ExerciseRunner({
  exercises,
  onResult,
  onFinish,
  exitTo = '/',
  finishedTitle = 'Lesson complete! 🎉',
  backLabel = 'Back to Dashboard',
}) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)

  if (!exercises || exercises.length === 0) {
    return (
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <p className="text-gray-600">Nothing to practice here yet.</p>
        <Link to={exitTo} className="text-primary-600 font-medium">
          {backLabel}
        </Link>
      </div>
    )
  }

  const exercise = exercises[index]
  const progressPct = Math.round((index / exercises.length) * 100)

  function handleResult(isCorrect, userAnswer) {
    onResult?.(exercise, isCorrect, userAnswer)
    const nextScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 }
    setScore(nextScore)

    if (index + 1 < exercises.length) {
      setIndex((i) => i + 1)
    } else {
      setFinished(true)
      onFinish?.(nextScore)
    }
  }

  if (finished) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 px-6 text-center mx-auto max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900">{finishedTitle}</h1>
        <p className="text-gray-600">
          You got <span className="font-semibold text-success">{score.correct}</span> out of{' '}
          {score.total} correct.
        </p>
        <Button as={Link} to={exitTo} className="px-8 mt-2">
          {backLabel}
        </Button>
      </div>
    )
  }

  const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type]

  return (
    <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to={exitTo} className="text-gray-400 text-xl leading-none">
          &times;
        </Link>
        <ProgressBar value={progressPct} trackClassName="bg-gray-200" className="flex-1" />
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
