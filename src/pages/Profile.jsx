import { Bell, BellOff, Flame, LogOut, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import SyncStatus from '../components/SyncStatus'
import { UNITS } from '../data/units'
import { formatStudyTime, getAnalytics, getWeeklyChartData } from '../lib/analytics'
import { signOut } from '../lib/auth'
import { LEVEL_LABELS } from '../lib/levels'
import { getMasteryLabel } from '../lib/mastery'
import { getLevel, getState } from '../lib/progress'
import {
  areRemindersEnabled,
  getNotificationPermission,
  isNotificationSupported,
  requestNotificationPermission,
  setRemindersEnabled,
} from '../lib/reminders'

const MASTERY_TONE = {
  New: 'gray',
  Learning: 'danger',
  Familiar: 'accent',
  Mastered: 'success',
}

const MASTERY_CHART_COLOR = {
  New: '#64748b',
  Learning: '#f43f5e',
  Familiar: '#f59e0b',
  Mastered: '#10b981',
}

const MASTERY_ORDER = ['New', 'Learning', 'Familiar', 'Mastered']

const SKILL_LABELS = {
  grammar: 'Grammar',
  listening: 'Listening',
  speaking: 'Speaking',
  writing: 'Writing',
  reading: 'Reading',
}

export default function Profile() {
  const state = getState()
  const level = getLevel(state.xp)
  const allWords = UNITS.flatMap((unit) => unit.vocab)

  const counts = Object.fromEntries(MASTERY_ORDER.map((label) => [label, 0]))
  for (const word of allWords) {
    counts[getMasteryLabel(state.words[word.id])]++
  }
  const chartData = MASTERY_ORDER.map((label) => ({ label, count: counts[label] }))

  const analytics = getAnalytics(new Date(), state)
  const weeklyChartData = getWeeklyChartData()

  const [remindersOn, setRemindersOn] = useState(() => areRemindersEnabled() && getNotificationPermission() === 'granted')
  const [permissionDenied, setPermissionDenied] = useState(() => getNotificationPermission() === 'denied')

  async function handleToggleReminders() {
    if (remindersOn) {
      setRemindersEnabled(false)
      setRemindersOn(false)
      return
    }
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      setRemindersEnabled(true)
      setRemindersOn(true)
      setPermissionDenied(false)
    } else if (permission === 'denied') {
      setPermissionDenied(true)
    }
  }

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-8 text-slate-100">
      {/* User Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{state.name}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
              Level {level}
            </span>
            <span>·</span>
            <span>{state.xp.toLocaleString()} XP</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Flame size={13} fill="currentColor" /> {state.streak.count}d
            </span>
          </div>
          <SyncStatus />
        </div>
        <button
          type="button"
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>

      {/* CEFR Level Card */}
      <Card as={Link} to="/placement" interactive className="flex items-center justify-between p-4.5 bg-gradient-to-r from-blue-900/60 to-slate-900/90 border-blue-500/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">CEFR level</p>
            <p className="font-bold text-white text-sm">
              {state.placementLevel ? `${state.placementLevel} · ${LEVEL_LABELS[state.placementLevel]}` : 'Not tested yet'}
            </p>
          </div>
        </div>
        <span className="text-xs text-cyan-300 font-bold bg-cyan-500/20 border border-cyan-400/30 px-3 py-1.5 rounded-full">
          {state.placementLevel ? 'Retake' : 'Take test'}
        </span>
      </Card>

      {/* Reminders Card */}
      {isNotificationSupported() && (
        <Card className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders</p>
            <p className="text-xs text-slate-300 mt-0.5">
              {permissionDenied
                ? 'Blocked in browser settings — allow notifications for this site.'
                : 'Streak, due words, and daily challenge nudges.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleReminders}
            disabled={permissionDenied}
            aria-label={remindersOn ? 'Disable reminders' : 'Enable reminders'}
            className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center border transition-all ${
              remindersOn
                ? 'bg-cyan-500/20 border-cyan-400/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-400'
            } disabled:opacity-50 cursor-pointer`}
          >
            {remindersOn ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </Card>
      )}

      {/* Analytics Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-white">Analytics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vocabulary</p>
            <p className="font-extrabold text-white text-base">
              {analytics.vocabLearned}/{analytics.vocabTotal}
            </p>
            <p className="text-xs text-cyan-400 font-medium">{analytics.vocabMastered} mastered</p>
          </Card>
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
            <p className="font-extrabold text-emerald-400 text-base">
              {analytics.overallAccuracy != null ? `${Math.round(analytics.overallAccuracy * 100)}%` : '—'}
            </p>
          </Card>
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Streak</p>
            <p className="font-extrabold text-amber-300 text-base">{analytics.currentStreak} days</p>
            <p className="text-xs text-slate-400 font-medium">Longest: {analytics.longestStreak}</p>
          </Card>
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Study time</p>
            <p className="font-extrabold text-cyan-300 text-base">{formatStudyTime(analytics.studyTimeMs)}</p>
            <p className="text-xs text-slate-400 font-medium">{analytics.sessionCount} sessions</p>
          </Card>
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This week</p>
            <p className="font-extrabold text-white text-base">{analytics.weeklyXp} XP</p>
          </Card>
          <Card padding="p-3.5" className="flex flex-col gap-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This month</p>
            <p className="font-extrabold text-white text-base">{analytics.monthlyXp} XP</p>
          </Card>
        </div>

        {/* Weekly Chart */}
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3.5 h-36 backdrop-blur-xl shadow-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#94a3b8" />
              <YAxis hide allowDecimals={false} />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="xp" radius={[4, 4, 0, 0]} fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-2">
          {Object.entries(SKILL_LABELS).map(([key, label]) => {
            const skill = analytics.skillProgress[key]
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 text-sm"
              >
                <span className="font-bold text-white">{label}</span>
                <span className="text-xs text-slate-400 font-medium">
                  {skill.topicsComplete}/{skill.topicsTotal} topics
                  {skill.accuracy != null && ` · ${Math.round(skill.accuracy * 100)}%`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mastery breakdown */}
      <div>
        <h2 className="text-lg font-bold text-white mb-2.5">Mastery breakdown</h2>
        <div className="rounded-2xl bg-slate-900/80 border border-white/10 p-3 h-44 backdrop-blur-xl shadow-lg">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis type="category" dataKey="label" width={70} tickLine={false} axisLine={false} stroke="#94a3b8" />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.label} fill={MASTERY_CHART_COLOR[entry.label]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vocabulary list */}
      <div className="flex flex-col gap-5 pb-6">
        <h2 className="text-lg font-bold text-white -mb-2">Vocabulary progress</h2>
        {UNITS.map((unit) => (
          <div key={unit.id} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{unit.title}</h3>
            {unit.vocab.map((word) => {
              const label = getMasteryLabel(state.words[word.id])
              return (
                <div
                  key={word.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3"
                >
                  <div>
                    <p className="font-bold text-white text-sm">{word.de}</p>
                    <p className="text-xs text-slate-400">{word.en}</p>
                  </div>
                  <Badge tone={MASTERY_TONE[label]}>{label}</Badge>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
