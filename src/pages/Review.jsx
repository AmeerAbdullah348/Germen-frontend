import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { UNITS } from '../data/units'
import { groupWordsByStatus } from '../lib/mastery'
import { getState } from '../lib/progress'

const TABS = [
  { key: 'due', label: 'Due' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'weak', label: 'Weak' },
  { key: 'recent', label: 'Recent' },
  { key: 'mastered', label: 'Mastered' },
]

export default function Review() {
  const navigate = useNavigate()
  const state = getState()
  const [tab, setTab] = useState('due')

  const wordsById = useMemo(
    () => Object.fromEntries(UNITS.flatMap((unit) => unit.vocab).map((word) => [word.id, word])),
    []
  )
  const allWordIds = useMemo(() => Object.keys(wordsById), [wordsById])
  const groups = useMemo(() => groupWordsByStatus(allWordIds, state), [allWordIds, state])

  const activeIds = groups[tab] ?? []

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Review Center</h1>
        <p className="text-gray-500 text-sm">Your vocabulary, grouped by what needs attention.</p>
      </div>

      <Button onClick={() => navigate('/review/session')} disabled={groups.due.length === 0}>
        Quick Review{groups.due.length > 0 ? ` (${groups.due.length})` : ''}
      </Button>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            {label} · {groups[key]?.length ?? 0}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {activeIds.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nothing here right now.</p>
        ) : (
          activeIds.map((id) => {
            const word = wordsById[id]
            if (!word) return null
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{word.de}</p>
                  <p className="text-sm text-gray-500">{word.en}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
