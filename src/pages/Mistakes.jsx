import { AlertTriangle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GRAMMAR_TOPICS } from '../data/grammar'
import { LISTENING_LESSONS } from '../data/listening'
import { SPEAKING_TOPICS } from '../data/speaking'
import { UNITS } from '../data/units'
import { WRITING_TOPICS } from '../data/writing'
import { useAuth } from '../lib/AuthContext'
import { getRecentMistakes } from '../lib/mistakes'
import { fetchRemoteMistakes } from '../lib/remoteSync'

function resolveExercise(mistake) {
  if (mistake.itemType === 'vocab') {
    for (const unit of UNITS) {
      const exercise = unit.exercises.find((ex) => ex.wordId === mistake.itemId)
      if (exercise) return exercise
    }
  }
  if (mistake.itemType === 'grammar') {
    for (const topic of GRAMMAR_TOPICS) {
      const exercise = topic.exercises.find((ex) => ex.itemId === mistake.itemId)
      if (exercise) return exercise
    }
  }
  if (mistake.itemType === 'writing') {
    for (const topic of WRITING_TOPICS) {
      const exercise = topic.exercises.find((ex) => ex.itemId === mistake.itemId)
      if (exercise) return exercise
    }
  }
  if (mistake.itemType === 'listening') {
    for (const topic of LISTENING_LESSONS) {
      const exercise = topic.exercises.find((ex) => ex.itemId === mistake.itemId)
      if (exercise) return exercise
    }
  }
  if (mistake.itemType === 'speaking') {
    for (const topic of SPEAKING_TOPICS) {
      const exercise = topic.exercises.find((ex) => ex.itemId === mistake.itemId)
      if (exercise) return exercise
    }
  }
  return null
}

function mistakeKey(m) {
  return `${m.itemType}:${m.itemId}:${m.createdAt}`
}

export default function Mistakes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [remoteMistakes, setRemoteMistakes] = useState([])

  useEffect(() => {
    if (!user?.id) return
    fetchRemoteMistakes(user.id).then(setRemoteMistakes)
  }, [user?.id])

  const mistakes = useMemo(() => {
    const local = getRecentMistakes()
    const merged = new Map()
    for (const m of [...remoteMistakes, ...local]) {
      merged.set(mistakeKey(m), m)
    }
    return [...merged.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [remoteMistakes])

  const groups = useMemo(() => {
    const byType = {}
    for (const m of mistakes) {
      if (!byType[m.itemType]) byType[m.itemType] = []
      byType[m.itemType].push(m)
    }
    return byType
  }, [mistakes])

  function practiceAgain(list) {
    const exercises = list.map(resolveExercise).filter(Boolean)
    if (exercises.length === 0) return
    navigate('/mistakes/session', { state: { exercises } })
  }

  if (mistakes.length === 0) {
    return (
      <div className="px-5 pt-12 flex flex-col gap-4 items-center justify-center text-center text-slate-100 min-h-[60vh]">
        <div className="h-16 w-16 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">No mistakes yet</h2>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Keep practicing! Any answers you get wrong will show up here for targeted practice.
        </p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100 min-w-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center justify-center">
            <AlertTriangle size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mistakes</h1>
        </div>
        <p className="text-slate-400 text-xs">Review what you got wrong and practice it again.</p>
      </div>

      {Object.entries(groups).map(([itemType, list]) => (
        <div key={itemType} className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white capitalize">{itemType}</h2>
            <span className="text-xs font-bold text-rose-400">({list.length})</span>
            <button
              type="button"
              onClick={() => practiceAgain(list)}
              className="ml-auto rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)] cursor-pointer shrink-0"
            >
              Practice again
            </button>
          </div>
          <div className="flex flex-col gap-2.5 min-w-0">
            {list.slice(0, 20).map((m) => (
              <div key={mistakeKey(m)} className="rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 shadow-md min-w-0 break-words [overflow-wrap:anywhere]">
                {m.userAnswer && <p className="text-xs text-rose-400 line-through font-medium mb-0.5 break-words">{m.userAnswer}</p>}
                <p className="font-bold text-emerald-400 text-sm break-words">{m.correctAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
