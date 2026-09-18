import { Zap } from 'lucide-react'
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
      <div className="px-5 pt-12 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-[60vh] bg-[#070b19]">
        <div className="h-16 w-16 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-yellow-300 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <Zap size={32} fill="currentColor" />
        </div>
        <h2 className="text-xl font-bold text-white">Challenge Complete!</h2>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          You've already completed today's challenge — come back tomorrow for new bonus XP!
        </p>
        <Link to="/" className="text-cyan-400 font-bold text-sm hover:underline mt-2">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!started) {
    return (
      <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10 bg-[#070b19] text-slate-100">
        <Link to="/" className="text-slate-400 hover:text-white text-2xl leading-none mb-8">
          &times;
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border border-white/20 text-yellow-300 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Daily Challenge</h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            A short mix of vocabulary, grammar, listening, and writing — {exercises.length} questions today.
          </p>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            +{DAILY_CHALLENGE_BONUS_XP} bonus XP on completion
          </span>
          <Button className="px-10 mt-3" onClick={() => setStarted(true)}>
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
        <div className="min-h-svh flex flex-col items-center justify-center gap-5 px-6 text-center mx-auto max-w-md bg-[#070b19] text-slate-100">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border border-white/20 text-yellow-300 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
            <Zap size={32} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Challenge complete! 🎉</h1>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 w-full backdrop-blur-xl">
            <p className="text-sm text-slate-300">
              You got <span className="font-extrabold text-emerald-400 text-base">{correct}</span> out of{' '}
              <span className="font-bold text-white text-base">{total}</span> correct!
            </p>
            <p className="text-xs font-bold text-amber-300 mt-2">+{DAILY_CHALLENGE_BONUS_XP} bonus XP earned</p>
          </div>
          <Button className="px-10 mt-2" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      )}
    />
  )
}
