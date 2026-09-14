import { Bell, BellOff, LogOut } from 'lucide-react'
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
  New: '#d1d5db',
  Learning: '#ef4444',
  Familiar: '#fbbf24',
  Mastered: '#22c55e',
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

      <Card as={Link} to="/placement" interactive className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500">CEFR level</p>
          <p className="font-medium text-gray-900">
            {state.placementLevel ? `${state.placementLevel} · ${LEVEL_LABELS[state.placementLevel]}` : 'Not tested yet'}
          </p>
        </div>
        <span className="text-sm text-primary-600 font-medium">
          {state.placementLevel ? 'Retake test' : 'Take test'}
        </span>
      </Card>

      {isNotificationSupported() && (
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500">Reminders</p>
            <p className="text-sm text-gray-600">
              {permissionDenied
                ? 'Blocked in your browser settings — allow notifications for this site to enable.'
                : 'Streak, due words, and daily challenge nudges while the app is open.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleReminders}
            disabled={permissionDenied}
            aria-label={remindersOn ? 'Disable reminders' : 'Enable reminders'}
            className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${
              remindersOn ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'
            } disabled:opacity-50`}
          >
            {remindersOn ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-gray-800">Analytics</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">Vocabulary</p>
            <p className="font-semibold text-gray-900">
              {analytics.vocabLearned}/{analytics.vocabTotal} learned
            </p>
            <p className="text-xs text-gray-400">{analytics.vocabMastered} mastered</p>
          </Card>
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">Accuracy</p>
            <p className="font-semibold text-gray-900">
              {analytics.overallAccuracy != null ? `${Math.round(analytics.overallAccuracy * 100)}%` : '—'}
            </p>
          </Card>
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">Streak</p>
            <p className="font-semibold text-gray-900">{analytics.currentStreak} days</p>
            <p className="text-xs text-gray-400">Longest: {analytics.longestStreak}</p>
          </Card>
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">Study time</p>
            <p className="font-semibold text-gray-900">{formatStudyTime(analytics.studyTimeMs)}</p>
            <p className="text-xs text-gray-400">{analytics.sessionCount} sessions</p>
          </Card>
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">This week</p>
            <p className="font-semibold text-gray-900">{analytics.weeklyXp} XP</p>
          </Card>
          <Card padding="p-3" className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500">This month</p>
            <p className="font-semibold text-gray-900">{analytics.monthlyXp} XP</p>
          </Card>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-3 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#9ca3af" />
              <YAxis hide allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="xp" radius={[4, 4, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2">
          {Object.entries(SKILL_LABELS).map(([key, label]) => {
            const skill = analytics.skillProgress[key]
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
              >
                <span className="text-gray-800">{label}</span>
                <span className="text-sm text-gray-500">
                  {skill.topicsComplete}/{skill.topicsTotal} topics
                  {skill.accuracy != null && ` · ${Math.round(skill.accuracy * 100)}%`}
                </span>
              </div>
            )
          })}
        </div>
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
              const label = getMasteryLabel(state.words[word.id])
              return (
                <div
                  key={word.id}
                  className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-gray-900">{word.de}</p>
                    <p className="text-sm text-gray-500">{word.en}</p>
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
