import { LogOut } from 'lucide-react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import SyncStatus from '../components/SyncStatus'
import { UNITS } from '../data/units'
import { signOut } from '../lib/auth'
import { getLevel, getState } from '../lib/progress'

function masteryLabel(card) {
  if (!card) return 'New'
  if (card.repetitions === 0) return 'Learning'
  if (card.repetitions < 3) return 'Familiar'
  return 'Mastered'
}

const MASTERY_COLOR = {
  New: 'bg-gray-100 text-gray-500',
  Learning: 'bg-red-50 text-danger',
  Familiar: 'bg-accent-100 text-accent-600',
  Mastered: 'bg-green-50 text-success',
}

const MASTERY_CHART_COLOR = {
  New: '#d1d5db',
  Learning: '#ef4444',
  Familiar: '#fbbf24',
  Mastered: '#22c55e',
}

const MASTERY_ORDER = ['New', 'Learning', 'Familiar', 'Mastered']

export default function Profile() {
  const state = getState()
  const level = getLevel(state.xp)
  const allWords = UNITS.flatMap((unit) => unit.vocab)

  const counts = Object.fromEntries(MASTERY_ORDER.map((label) => [label, 0]))
  for (const word of allWords) {
    counts[masteryLabel(state.words[word.id])]++
  }
  const chartData = MASTERY_ORDER.map((label) => ({ label, count: counts[label] }))

  return (
    <div className="px-5 pt-8 flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{state.name}</h1>
            <p className="text-gray-500">
              Level {level} · {state.xp} XP · {state.streak.count} day streak
            </p>
          </div>
          <SyncStatus />
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-sm text-gray-400 shrink-0"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-2">Mastery breakdown</h2>
        <div className="rounded-2xl bg-white border border-gray-200 p-2 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis type="category" dataKey="label" width={70} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.label} fill={MASTERY_CHART_COLOR[entry.label]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-5 pb-6">
        <h2 className="text-lg font-medium text-gray-800 -mb-2">Vocabulary progress</h2>
        {UNITS.map((unit) => (
          <div key={unit.id} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-gray-500">{unit.title}</h3>
            {unit.vocab.map((word) => {
              const label = masteryLabel(state.words[word.id])
              return (
                <div
                  key={word.id}
                  className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{word.de}</p>
                    <p className="text-sm text-gray-500">{word.en}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${MASTERY_COLOR[label]}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
