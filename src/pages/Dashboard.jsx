import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle,
  Flame,
  GraduationCap,
  Headphones,
  LibraryBig,
  Lock,
  Mic,
  PenLine,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InstallBanner from '../components/InstallBanner'
import LearningCard from '../components/dashboard/LearningCard'
import StatBox from '../components/dashboard/StatBox'
import StreakCard from '../components/dashboard/StreakCard'
import ProgressBar from '../components/ui/ProgressBar'
import SyncStatus from '../components/SyncStatus'
import { UNITS } from '../data/units'
import { checkAndUnlockAchievements } from '../lib/achievements'
import { getAnalytics, getWeeklyChartData } from '../lib/analytics'
import { DAILY_CHALLENGE_BONUS_XP, isDailyChallengeDoneToday } from '../lib/dailyChallenge'
import { getThemeForPath } from '../lib/designSystem'
import { getLevelGroups } from '../lib/levels'
import { getRecommendations } from '../lib/recommendations'
import { checkAndNotify } from '../lib/reminders'
import {
  DAILY_XP_GOAL,
  getDailyXp,
  getDueWordIds,
  getLevel,
  getState,
  getXpIntoLevel,
  XP_PER_LEVEL_TOTAL,
} from '../lib/progress'

const REC_META = {
  review: { icon: RefreshCw, description: 'Catch up on spaced repetition' },
  grammar: { icon: BookOpen, description: 'Sharpen your grammar skills' },
  listening: { icon: Headphones, description: 'Train your ear for German' },
  speaking: { icon: Mic, description: 'Practice speaking with AI partner' },
  writing: { icon: PenLine, description: 'Improve your writing accuracy' },
  reading: { icon: BookMarked, description: 'Read short German passages' },
  lesson: { icon: LibraryBig, description: 'Continue your vocabulary unit' },
}

function getRecMeta(to) {
  const prefix = to.split('/')[1]
  return REC_META[prefix] || { icon: Sparkles, description: 'Recommended for you' }
}

function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatCompactTime(ms) {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes < 60) return `${totalMinutes}m`
  return `${Math.round(totalMinutes / 60)}h`
}

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
    <button
      type="button"
      disabled={locked}
      aria-disabled={locked || undefined}
      onClick={locked ? undefined : onClick}
      className={[
        'text-left w-full rounded-2xl border p-4 flex items-center gap-3 transition-all',
        locked
          ? 'border-white/5 bg-slate-900/40 text-slate-500 cursor-not-allowed'
          : 'border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-lg hover:border-cyan-500/40 active:scale-[0.99]',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-bold truncate ${locked ? 'text-slate-500' : 'text-white'}`}>{unit.title}</p>
        <p className={`text-xs mt-0.5 truncate ${locked ? 'text-slate-600' : 'text-slate-400'}`}>{unit.description}</p>
      </div>
      {locked ? (
        <Lock className="shrink-0 text-slate-600" size={18} />
      ) : dueCount > 0 ? (
        <span className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.4)]">
          {dueCount} due
        </span>
      ) : (
        <span className="shrink-0 h-8 w-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white">
          <ArrowRight size={14} />
        </span>
      )}
    </button>
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
  const analytics = useMemo(() => getAnalytics(new Date(), state), [state])
  const weekActivity = useMemo(() => getWeeklyChartData(new Date()).map((d) => d.xp > 0), [])
  const challengeDone = isDailyChallengeDoneToday()

  useEffect(() => {
    checkAndUnlockAchievements()
    checkAndNotify()
  }, [])

  const searchResults = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return null
    return UNITS.map((unit) => matchUnit(unit, trimmed)).filter(Boolean)
  }, [query])

  return (
    <div className="min-h-full px-5 pt-8 flex flex-col gap-6 pb-8">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            {getGreeting()}, {state.name}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">Ready to practice?</h1>
          <SyncStatus />
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 text-amber-300 font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md text-xs">
          <Flame size={15} className="text-amber-400 fill-amber-400 animate-pulse" />
          <span>{state.xp.toLocaleString()} XP</span>
        </div>
      </div>

      <InstallBanner />

      {/* Streak Hero Card */}
      <StreakCard streakCount={state.streak.count} weekActivity={weekActivity} />

      {/* Quick Stats Trio */}
      <div className="flex gap-3">
        <StatBox value={analytics.sessionCount} label="Lessons" />
        <StatBox value={formatCompactTime(analytics.studyTimeMs)} label="Time" />
        <StatBox
          value={analytics.overallAccuracy != null ? `${Math.round(analytics.overallAccuracy * 100)}%` : '—'}
          label="Accuracy"
        />
      </div>

      {/* Level & Daily Goal Cards */}
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white">Level {level}</p>
            <p className="text-xs text-slate-400 font-medium">
              {xpIntoLevel}/{XP_PER_LEVEL_TOTAL} XP · {state.xp} total
            </p>
          </div>
          <ProgressBar value={xpIntoLevel} max={XP_PER_LEVEL_TOTAL} heightClassName="h-2" />
        </div>

        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-4 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target size={16} className="text-cyan-400" />
              <p className="text-sm font-bold text-white">Daily Goal</p>
            </div>
            <div className="flex items-center gap-1.5">
              {dailyGoalPct >= 100 && <CheckCircle size={15} className="text-emerald-400" />}
              <p className="text-xs text-slate-400 font-medium">
                {dailyXp}/{DAILY_XP_GOAL} XP
              </p>
            </div>
          </div>
          <ProgressBar
            value={dailyXp}
            max={DAILY_XP_GOAL}
            colorClassName="bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            heightClassName="h-2"
          />
        </div>
      </div>

      {/* Featured Cards */}
      <LearningCard
        icon={Zap}
        title="Daily Challenge"
        description={
          challengeDone ? 'Completed — come back tomorrow' : `A short mixed session · +${DAILY_CHALLENGE_BONUS_XP} XP`
        }
        disabled={challengeDone}
        theme={getThemeForPath('/daily-challenge')}
        onClick={() => navigate('/daily-challenge')}
      />

      {!state.placementLevel && (
        <LearningCard
          icon={GraduationCap}
          title="Find your level"
          description="Take a quick placement test to unlock the right content."
          theme={getThemeForPath('/placement')}
          onClick={() => navigate('/placement')}
        />
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white">Continue Learning</h2>
          {recommendations.map((rec) => {
            const meta = getRecMeta(rec.to)
            return (
              <LearningCard
                key={rec.id}
                icon={meta.icon}
                title={rec.label}
                description={meta.description}
                theme={getThemeForPath(rec.to)}
                onClick={() => navigate(rec.to)}
              />
            )
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a word or unit…"
          className="w-full rounded-2xl bg-slate-900/90 border border-white/10 pl-11 pr-10 py-3.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {searchResults ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white">
            {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No results'}
          </h2>
          {searchResults.map(({ unit, matchedWord }) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => navigate(`/lesson/${unit.id}`)}
              className="text-left w-full rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white truncate">{unit.title}</p>
                {matchedWord ? (
                  <p className="text-xs text-slate-300 truncate mt-0.5">
                    <span className="text-cyan-300 font-bold">{matchedWord.de}</span>
                    {' — '}
                    {matchedWord.en}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{unit.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {levelGroups.map((group) => (
            <div key={group.level} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-bold text-white">
                  {group.level} <span className="text-slate-400 font-normal">· {group.label}</span>
                </h2>
                <span className="ml-auto text-xs font-semibold text-cyan-400">
                  {group.completedCount}/{group.totalCount} units
                </span>
              </div>
              {!group.unlocked && (
                <p className="text-xs text-slate-400 -mt-1.5">
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
