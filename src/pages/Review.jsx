import { RefreshCw } from 'lucide-react'
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
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center">
            <RefreshCw size={16} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Review Center</h1>
        </div>
        <p className="text-slate-400 text-xs">Your vocabulary, grouped by what needs attention.</p>
      </div>

      <Button onClick={() => navigate('/review/session')} disabled={groups.due.length === 0}>
        Quick Review{groups.due.length > 0 ? ` (${groups.due.length})` : ''}
      </Button>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              tab === key
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_12px_rgba(14,165,233,0.4)]'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            {label} · {groups[key]?.length ?? 0}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {activeIds.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Nothing here right now.</p>
        ) : (
          activeIds.map((id) => {
            const word = wordsById[id]
            if (!word) return null
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 shadow-md"
              >
                <div>
                  <p className="font-bold text-white text-sm">{word.de}</p>
                  <p className="text-xs text-slate-400">{word.en}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
