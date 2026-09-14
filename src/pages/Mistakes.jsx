import { AlertTriangle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GRAMMAR_TOPICS } from '../data/grammar'
import { UNITS } from '../data/units'
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
  return null
}

function mistakeKey(m) {
  return `${m.itemType}:${m.itemId}:${m.createdAt}`
}

export default function Mistakes() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [remoteMistakes, setRemoteMistakes] = useState([])

  // Fetched lazily here (not during login hydration) since this is a log the
  // user browses, not current state the rest of the app depends on.
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
      <div className="px-5 pt-8 flex flex-col gap-4 items-center text-center">
        <AlertTriangle className="text-gray-300" size={40} />
        <p className="text-gray-500">No mistakes yet — keep practicing!</p>
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Mistakes</h1>
        <p className="text-gray-500 text-sm">Review what you got wrong and practice it again.</p>
      </div>

      {Object.entries(groups).map(([itemType, list]) => (
        <div key={itemType} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium text-gray-800 capitalize">{itemType}</h2>
            <span className="text-xs font-medium text-gray-400">{list.length}</span>
            <button
              type="button"
              onClick={() => practiceAgain(list)}
              className="ml-auto rounded-lg border border-primary-500 text-primary-600 px-3 py-1.5 text-xs font-medium"
            >
              Practice again
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {list.slice(0, 20).map((m) => (
              <div key={mistakeKey(m)} className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                {m.userAnswer && <p className="text-sm text-danger line-through">{m.userAnswer}</p>}
                <p className="font-medium text-gray-900">{m.correctAnswer}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
