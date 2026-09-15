import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CheckCircle,
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

// Icon + subtitle for a recommendation card, keyed by the first path segment
// of its route — covers every route getRecommendations() can produce
// ('/review', '/grammar[...]', '/listening', '/speaking', '/writing',
// '/reading', '/lesson/...'). Falls back to a generic icon/subtitle for any
// future route this doesn't know about, so a new skill never breaks the UI.
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
        'text-left w-full rounded-2xl border p-4 flex items-center gap-3',
        locked ? 'border-gray-100 bg-gray-50 cursor-not-allowed' : 'border-gray-200 bg-white active:scale-[0.99] transition-transform',
      ].join(' ')}
    >
      <div className="min-w-0 flex-1">
        <p className={`font-semibold truncate ${locked ? 'text-gray-400' : 'text-black'}`}>{unit.title}</p>
        <p className={`text-sm truncate ${locked ? 'text-gray-400' : 'text-gray-500'}`}>{unit.description}</p>
      </div>
      {locked ? (
        <Lock className="shrink-0 text-gray-300" size={18} />
      ) : dueCount > 0 ? (
        <span className="shrink-0 bg-black text-white text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
          {dueCount} due
        </span>
      ) : (
        <span className="shrink-0 h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center text-black">
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

  // Achievements are derived from progress rather than recorded directly, so
  // check for newly-earned ones opportunistically whenever the Dashboard mounts.
  // Reminders are similarly a once-per-session/day check, not tied to any
  // specific action.
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
    <div className="min-h-full bg-white px-5 pt-8 flex flex-col gap-6 pb-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">
            {getGreeting()}, {state.name}
          </p>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-black">Ready to practice?</h1>
        </div>
        <SyncStatus />
      </div>

      <InstallBanner />

      <StreakCard streakCount={state.streak.count} weekActivity={weekActivity} />

      <div className="flex gap-3">
        <StatBox value={analytics.sessionCount} label="Lessons" />
        <StatBox value={formatCompactTime(analytics.studyTimeMs)} label="Time" />
        <StatBox
          value={analytics.overallAccuracy != null ? `${Math.round(analytics.overallAccuracy * 100)}%` : '—'}
          label="Accuracy"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-gray-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">Level {level}</p>
            <p className="text-xs text-gray-400">
              {xpIntoLevel}/{XP_PER_LEVEL_TOTAL} XP · {state.xp} total
            </p>
          </div>
          <ProgressBar value={xpIntoLevel} max={XP_PER_LEVEL_TOTAL} colorClassName="bg-black" trackClassName="bg-gray-100" heightClassName="h-1.5" />
        </div>

        <div className="rounded-2xl border border-gray-200 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target size={15} className="text-black" />
              <p className="text-sm font-semibold text-black">Daily Goal</p>
            </div>
            <div className="flex items-center gap-1.5">
              {dailyGoalPct >= 100 && <CheckCircle size={14} className="text-black" />}
              <p className="text-xs text-gray-400">
                {dailyXp}/{DAILY_XP_GOAL} XP
              </p>
            </div>
          </div>
          <ProgressBar value={dailyXp} max={DAILY_XP_GOAL} colorClassName="bg-black" trackClassName="bg-gray-100" heightClassName="h-1.5" />
        </div>
      </div>

      <LearningCard
        icon={Zap}
        title="Daily Challenge"
        description={
          challengeDone ? 'Completed — come back tomorrow' : `A short mixed session · +${DAILY_CHALLENGE_BONUS_XP} XP`
        }
        disabled={challengeDone}
        onClick={() => navigate('/daily-challenge')}
      />

      {!state.placementLevel && (
        <LearningCard
          icon={GraduationCap}
          title="Find your level"
          description="Take a quick placement test to unlock the right content."
          onClick={() => navigate('/placement')}
        />
      )}

      {recommendations.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-black">Continue Learning</h2>
          {recommendations.map((rec) => {
            const meta = getRecMeta(rec.to)
            return (
              <LearningCard
                key={rec.id}
                icon={meta.icon}
                title={rec.label}
                description={meta.description}
                onClick={() => navigate(rec.to)}
              />
            )
          })}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a word or unit…"
          className="w-full rounded-2xl bg-white border border-gray-200 pl-10 pr-9 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-black"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {searchResults ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-black">
            {searchResults.length > 0 ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No results'}
          </h2>
          {searchResults.map(({ unit, matchedWord }) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => navigate(`/lesson/${unit.id}`)}
              className="text-left w-full rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3 active:scale-[0.99] transition-transform"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-black truncate">{unit.title}</p>
                {matchedWord ? (
                  <p className="text-sm text-gray-500 truncate">
                    <span className="text-black font-semibold">{matchedWord.de}</span>
                    {' — '}
                    {matchedWord.en}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 truncate">{unit.description}</p>
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
                <h2 className="text-lg font-bold text-black">
                  {group.level} <span className="text-gray-400 font-normal">· {group.label}</span>
                </h2>
                <span className="ml-auto text-xs font-semibold text-gray-400">
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
