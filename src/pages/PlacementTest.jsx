import { GraduationCap, ShieldCheck } from 'lucide-react'
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
      <div className="min-h-svh flex flex-col mx-auto max-w-md px-5 pt-6 pb-10 bg-[#070b19] text-slate-100">
        <Link to="/" className="text-slate-400 hover:text-white text-2xl leading-none mb-8">
          &times;
        </Link>
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center">
          <div className="h-16 w-16 rounded-full bg-blue-500/20 border border-blue-400/40 text-cyan-300 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Placement Test</h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            16 quick questions across vocabulary, grammar, reading, and listening. Takes about 5 minutes and
            estimates your CEFR level so you can start in the right place.
          </p>
          <p className="text-xs text-slate-400">This won't affect or reset any progress you've already made.</p>
          <Button className="px-10 mt-3" onClick={() => setStarted(true)}>
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
          <div className="min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center mx-auto max-w-md bg-[#070b19] text-slate-100">
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <ShieldCheck size={28} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">Your estimated level</p>
              <h1 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.6)] mt-1">{estimate}</h1>
              <p className="text-sm font-semibold text-slate-300">{LEVEL_LABELS[estimate]}</p>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {Object.entries(bySection).map(([section, { correct, total }]) => (
                <div
                  key={section}
                  className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-white/10 px-4 py-3"
                >
                  <span className="text-slate-200 font-bold text-sm">{SECTION_LABELS[section] ?? section}</span>
                  <span className="text-xs text-cyan-300 font-bold">
                    {correct}/{total}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
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
