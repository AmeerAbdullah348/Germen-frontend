import { Flame, Star, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SyncStatus from '../components/SyncStatus'
import { UNITS } from '../data/units'
import {
  DAILY_XP_GOAL,
  getDailyXp,
  getDueWordIds,
  getLevel,
  getState,
  getXpIntoLevel,
  XP_PER_LEVEL_TOTAL,
} from '../lib/progress'

export default function Dashboard() {
  const navigate = useNavigate()
  const state = getState()
  const level = getLevel(state.xp)
  const xpIntoLevel = getXpIntoLevel(state.xp)
  const dailyXp = getDailyXp()
  const dailyGoalPct = Math.min(100, Math.round((dailyXp / DAILY_XP_GOAL) * 100))

  return (
    <div className="px-5 pt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-gray-500">Willkommen zurück,</p>
          <h1 className="text-2xl font-semibold text-gray-900">{state.name}</h1>
        </div>
        <SyncStatus />
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3">
          <Flame className="text-accent-500" size={28} />
          <div>
            <p className="text-xl font-semibold text-gray-900">{state.streak.count}</p>
            <p className="text-xs text-gray-500">Day streak</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl bg-white border border-gray-200 p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <Star className="text-primary-500" size={28} />
            <div>
              <p className="text-xl font-semibold text-gray-900">Lvl {level}</p>
              <p className="text-xs text-gray-500">{state.xp} XP</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${(xpIntoLevel / XP_PER_LEVEL_TOTAL) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Target className="text-accent-500" size={18} />
          <p className="text-sm font-medium text-gray-800">Daily goal</p>
          <p className="ml-auto text-sm text-gray-500">
            {dailyXp}/{DAILY_XP_GOAL} XP
          </p>
        </div>
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full ${dailyGoalPct >= 100 ? 'bg-success' : 'bg-accent-400'}`}
            style={{ width: `${dailyGoalPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-6">
        <h2 className="text-lg font-medium text-gray-800">Units</h2>
        {UNITS.map((unit) => {
          const dueCount = getDueWordIds(unit.vocab.map((w) => w.id)).length
          return (
            <button
              key={unit.id}
              type="button"
              onClick={() => navigate(`/lesson/${unit.id}`)}
              className="text-left rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{unit.title}</p>
                <p className="text-sm text-gray-500 truncate">{unit.description}</p>
              </div>
              {dueCount > 0 && (
                <span className="shrink-0 whitespace-nowrap rounded-full bg-accent-100 text-accent-600 text-xs font-semibold px-2.5 py-1">
                  {dueCount} due
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
