import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { recordSession } from '../lib/progress'
import Button from './ui/Button'
import ProgressBar from './ui/ProgressBar'
import FillBlank from './lesson/FillBlank'
import Flashcard from './lesson/Flashcard'
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

export default function ExerciseRunner({
  exercises,
  onResult,
  onFinish,
  exitTo = '/',
  finishedTitle = 'Lesson complete! 🎉',
  backLabel = 'Back to Dashboard',
  renderFinished,
}) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)
  const [startTime] = useState(() => Date.now())

  if (!exercises || exercises.length === 0) {
    return (
      <div className="min-h-svh bg-[#070b19] px-5 pt-8 flex flex-col gap-4 items-center justify-center text-center text-slate-100">
        <p className="text-slate-400 text-sm">Nothing to practice here yet.</p>
        <Link to={exitTo} className="text-cyan-400 font-bold hover:underline text-sm">
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
      recordSession(Date.now() - startTime, nextScore)
      onFinish?.(nextScore)
    }
  }

  if (finished) {
    if (renderFinished) return renderFinished(score)

    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-5 px-6 text-center mx-auto max-w-md bg-[#070b19] text-slate-100">
        <div className="h-16 w-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{finishedTitle}</h1>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 w-full backdrop-blur-xl">
          <p className="text-sm text-slate-300">
            You got <span className="font-extrabold text-emerald-400 text-base">{score.correct}</span> out of{' '}
            <span className="font-bold text-white text-base">{score.total}</span> correct!
          </p>
        </div>
        <Button as={Link} to={exitTo} className="px-10 mt-2">
          {backLabel}
        </Button>
      </div>
    )
  }

  const ExerciseComponent = EXERCISE_COMPONENTS[exercise.type]

  return (
    <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10 bg-[#070b19] text-slate-100 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-blue-600/10 to-transparent pointer-events-none z-0" />

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link to={exitTo} className="text-slate-400 hover:text-white transition-colors">
          <X size={22} />
        </Link>
        <ProgressBar value={progressPct} trackClassName="bg-slate-800/80 border border-white/5" className="flex-1" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {ExerciseComponent ? (
          <ExerciseComponent key={index} exercise={exercise} onResult={handleResult} />
        ) : (
          <p className="text-slate-400">Unsupported exercise type: {exercise.type}</p>
        )}
      </div>
    </div>
  )
}
