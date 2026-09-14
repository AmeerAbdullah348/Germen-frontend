import { ChevronRight, Flame, GraduationCap, Lock, Search, Star, Target, X, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import SyncStatus from '../components/SyncStatus'
import { UNITS } from '../data/units'
import { checkAndUnlockAchievements } from '../lib/achievements'
import { DAILY_CHALLENGE_BONUS_XP, isDailyChallengeDoneToday } from '../lib/dailyChallenge'
import { getLevelGroups } from '../lib/levels'
import { getRecommendations } from '../lib/recommendations'
import {
  DAILY_XP_GOAL,
  getDailyXp,
  getDueWordIds,
  getLevel,
  getState,
  getXpIntoLevel,
  XP_PER_LEVEL_TOTAL,
} from '../lib/progress'

function matchUnit(unit, query) {
  const q = query.toLowerCase()
  if (unit.title.toLowerCase().includes(q)) return { unit, matchedWord: null }
  const matchedWord = unit.vocab.find(
    (w) => w.de.toLowerCase().includes(q) || w.en.toLowerCase().includes(q)
  )
  return matchedWord ? { unit, matchedWord } : null
}

function UnitCard({ unit, dueCount, locked, onClick }) {
  return (
    <Card
      as="button"
      type="button"
      disabled={locked}
      onClick={onClick}
      interactive
      className={`text-left flex items-center gap-3 ${locked ? 'cursor-not-allowed' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-medium truncate ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
          {unit.title}
        </p>
        <p className={`text-sm truncate ${locked ? 'text-gray-400' : 'text-gray-500'}`}>
          {unit.description}
        </p>
      </div>
      {locked ? (
        <Lock className="shrink-0 text-gray-300" size={18} />
      ) : (
        dueCount > 0 && (
          <Badge tone="accent" className="shrink-0 whitespace-nowrap">
            {dueCount} due
          </Badge>
        )
      )}
    </Card>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const state = getState()
  const level = getLevel(state.xp)
  const xpIntoLevel = getXpIntoLevel(state.xp)
  const dailyXp = getDailyXp()
  const dailyGoalPct = Math.min(100, Math.round((dailyXp / DAILY_XP_GOAL) * 100))
  const [query, setQuery] = useState('')

  const levelGroups = useMemo(() => getLevelGroups(UNITS, state), [state])
  const recommendations = useMemo(() => getRecommendations(new Date(), state), [state])
  const challengeDone = isDailyChallengeDoneToday()

  // Achievements are derived from progress rather than recorded directly, so
  // check for newly-earned ones opportunistically whenever the Dashboard mounts.
  useEffect(() => {
    checkAndUnlockAchievements()
  }, [])

  const searchResults = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return null
    return UNITS.map((unit) => matchUnit(unit, trimmed)).filter(Boolean)
  }, [query])

  return (
    <div className="px-5 pt-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-gray-500">Willkommen zurück,</p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{state.name}</h1>
        </div>
        <SyncStatus />
      </div>

      <div className="flex gap-3">
        <Card className="flex-1 flex items-center gap-3">
          <div className="shrink-0 h-11 w-11 rounded-full bg-accent-50 flex items-center justify-center">
            <Flame className="text-accent-500" size={22} />
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900 leading-tight">{state.streak.count}</p>
            <p className="text-xs text-gray-500">Day streak</p>
          </div>
        </Card>
        <Card className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="shrink-0 h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center">
              <Star className="text-primary-500" size={22} />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 leading-tight">Lvl {level}</p>
              <p className="text-xs text-gray-500">{state.xp} XP</p>
            </div>
          </div>
          <ProgressBar value={xpIntoLevel} max={XP_PER_LEVEL_TOTAL} heightClassName="h-1.5" />
        </Card>
      </div>

      <Card className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Target className="text-accent-500" size={18} />
          <p className="text-sm font-medium text-gray-800">Daily goal</p>
          <p className="ml-auto text-sm text-gray-500">
            {dailyXp}/{DAILY_XP_GOAL} XP
          </p>
        </div>
        <ProgressBar
          value={dailyXp}
          max={DAILY_XP_GOAL}
          colorClassName={dailyGoalPct >= 100 ? 'bg-success' : 'bg-accent-400'}
        />
      </Card>

      <Card
        as="button"
        type="button"
        interactive
        disabled={challengeDone}
        onClick={() => navigate('/daily-challenge')}
        className={`text-left flex items-center gap-3 ${challengeDone ? 'cursor-not-allowed' : ''}`}
      >
        <div className="shrink-0 h-11 w-11 rounded-full bg-accent-50 flex items-center justify-center">
          <Zap className={challengeDone ? 'text-gray-300' : 'text-accent-500'} size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-medium ${challengeDone ? 'text-gray-400' : 'text-gray-900'}`}>Daily Challenge</p>
          <p className={`text-sm ${challengeDone ? 'text-gray-400' : 'text-gray-500'}`}>
            {challengeDone ? 'Completed — come back tomorrow' : `A short mixed session · +${DAILY_CHALLENGE_BONUS_XP} XP`}
          </p>
        </div>
      </Card>

      {!state.placementLevel && (
        <Card
          as="button"
          type="button"
          interactive
          onClick={() => navigate('/placement')}
          className="text-left flex items-center gap-3"
        >
          <div className="shrink-0 h-11 w-11 rounded-full bg-primary-50 flex items-center justify-center">
            <GraduationCap className="text-primary-500" size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">Find your level</p>
            <p className="text-sm text-gray-500">Take a quick placement test to unlock the right content.</p>
          </div>
        </Card>
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-500">Recommended for you</h2>
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              as="button"
              type="button"
              interactive
              onClick={() => navigate(rec.to)}
              className="text-left flex items-center justify-between"
            >
              <span className="text-gray-800 font-medium">{rec.label}</span>
              <ChevronRight className="text-gray-300" size={18} />
            </Card>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a word or unit…"
          className="w-full rounded-2xl bg-white border border-gray-200 shadow-sm pl-10 pr-9 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {searchResults ? (
        <div className="flex flex-col gap-3 pb-6">
          <h2 className="text-lg font-medium text-gray-800">
            {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No results'}
          </h2>
          {searchResults.map(({ unit, matchedWord }) => (
            <Card
              key={unit.id}
              as="button"
              type="button"
              interactive
              onClick={() => navigate(`/lesson/${unit.id}`)}
              className="text-left flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">{unit.title}</p>
                {matchedWord ? (
                  <p className="text-sm text-gray-500 truncate">
                    <span className="text-primary-600 font-medium">{matchedWord.de}</span>
                    {' — '}
                    {matchedWord.en}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 truncate">{unit.description}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-6">
          {levelGroups.map((group) => (
            <div key={group.level} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-medium text-gray-800">
                  {group.level} <span className="text-gray-400 font-normal">· {group.label}</span>
                </h2>
                <span className="ml-auto text-xs font-medium text-gray-400">
                  {group.completedCount}/{group.totalCount} units
                </span>
              </div>
              {!group.unlocked && (
                <p className="text-xs text-gray-400 -mt-1.5">
                  Complete the previous level to unlock
                </p>
              )}
              {group.units.map((unit) => {
                const dueCount = group.unlocked
                  ? getDueWordIds(unit.vocab.map((w) => w.id)).length
                  : 0
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    dueCount={dueCount}
                    locked={!group.unlocked}
                    onClick={() => navigate(`/lesson/${unit.id}`)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
