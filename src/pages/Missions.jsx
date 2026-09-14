import { useState } from 'react'
import Card from '../components/ui/Card'
import ProgressBar from '../components/ui/ProgressBar'
import { claimMission, getMissionsWithProgress } from '../lib/missions'

function MissionRow({ mission, period, onClaimed }) {
  function handleClaim() {
    if (claimMission(mission.id, period)) onClaimed()
  }

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-gray-800 font-medium">{mission.label}</p>
        <span className="text-xs text-gray-400 shrink-0">
          {mission.progress}/{mission.target}
        </span>
      </div>
      <ProgressBar value={mission.progress} max={mission.target} heightClassName="h-1.5" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-accent-600 font-medium">+{mission.xp} XP</span>
        {mission.complete && !mission.claimed && (
          <button
            type="button"
            onClick={handleClaim}
            className="rounded-lg border border-primary-500 text-primary-600 px-3 py-1.5 text-xs font-medium"
          >
            Claim
          </button>
        )}
        {mission.claimed && <span className="text-xs text-success font-medium">Claimed</span>}
      </div>
    </Card>
  )
}

export default function Missions() {
  const [refreshKey, setRefreshKey] = useState(0)
  const dailyMissions = getMissionsWithProgress('daily')
  const weeklyMissions = getMissionsWithProgress('weekly')
  void refreshKey // read to satisfy the linter that this state drives a re-render

  return (
    <div className="px-5 pt-8 flex flex-col gap-6 pb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Missions</h1>
        <p className="text-gray-500 text-sm">Complete missions for bonus XP.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-500">Daily</h2>
        {dailyMissions.map((mission) => (
          <MissionRow
            key={mission.id}
            mission={mission}
            period="daily"
            onClaimed={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-500">Weekly</h2>
        {weeklyMissions.map((mission) => (
          <MissionRow
            key={mission.id}
            mission={mission}
            period="weekly"
            onClaimed={() => setRefreshKey((k) => k + 1)}
          />
        ))}
      </div>
    </div>
  )
}
